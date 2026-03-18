const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PriceDefinition {
  id: string;
  name: string;
  symbol: string;
  category: string;
  unit: string;
  proxyFor: string[];
}

interface PricingItem extends PriceDefinition {
  price: number | null;
  currency: string;
  lastUpdated: string | null;
  previousClose: number | null;
  changePercent: number | null;
  status: "available" | "unavailable";
}

const PRICE_DEFINITIONS: PriceDefinition[] = [
  {
    id: "steel-hrc",
    name: "Steel Coil (HRC)",
    symbol: "HRC=F",
    category: "Metals",
    unit: "USD / short ton",
    proxyFor: ["TMT Bars", "Structural Steel"],
  },
  {
    id: "copper",
    name: "Copper",
    symbol: "HG=F",
    category: "Metals",
    unit: "USD / lb",
    proxyFor: ["Electrical Wires", "Cables"],
  },
  {
    id: "aluminum",
    name: "Aluminum",
    symbol: "ALI=F",
    category: "Metals",
    unit: "USD / mt",
    proxyFor: ["Window Frames", "Panels"],
  },
  {
    id: "crude-oil",
    name: "Crude Oil",
    symbol: "CL=F",
    category: "Energy",
    unit: "USD / barrel",
    proxyFor: ["Bitumen", "Transport Costs"],
  },
];

const FETCH_TIMEOUT_MS = 3500;
const MAX_RETRIES = 2;

function fallbackItem(definition: PriceDefinition): PricingItem {
  return {
    ...definition,
    price: null,
    currency: "USD",
    lastUpdated: null,
    previousClose: null,
    changePercent: null,
    status: "unavailable",
  };
}

async function fetchWithRetry(url: string, retries = MAX_RETRIES): Promise<Response> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        headers: {
          "Accept": "application/json",
          "User-Agent": "Lovable-Market-Pricing",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Pricing upstream failed [${response.status}]`);
      }

      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      lastError = error;

      if (attempt === retries) {
        throw lastError;
      }

      await new Promise((resolve) => setTimeout(resolve, 250 * (attempt + 1)));
    }
  }

  throw lastError ?? new Error("Unknown pricing fetch error");
}

function lastValidNumber(values: Array<number | null | undefined>) {
  for (let index = values.length - 1; index >= 0; index -= 1) {
    const value = values[index];
    if (typeof value === "number" && Number.isFinite(value)) {
      return { value, index };
    }
  }

  return { value: null, index: -1 };
}

async function fetchPrice(definition: PriceDefinition): Promise<PricingItem> {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(definition.symbol)}?interval=1d&range=5d`;
    const response = await fetchWithRetry(url);
    const payload = await response.json();

    const result = payload?.chart?.result?.[0];
    const timestamps = result?.timestamp ?? [];
    const quote = result?.indicators?.quote?.[0] ?? {};
    const closes = Array.isArray(quote?.close) ? quote.close : [];
    const { value: latestPrice, index } = lastValidNumber(closes);
    const latestTimestamp = index >= 0 ? timestamps?.[index] : null;
    const previousClose = typeof result?.meta?.chartPreviousClose === "number"
      ? result.meta.chartPreviousClose
      : null;
    const changePercent = latestPrice != null && previousClose
      ? Number((((latestPrice - previousClose) / previousClose) * 100).toFixed(2))
      : null;

    if (latestPrice == null || latestTimestamp == null) {
      return fallbackItem(definition);
    }

    return {
      ...definition,
      price: Number(latestPrice.toFixed(2)),
      currency: result?.meta?.currency ?? "USD",
      lastUpdated: new Date(latestTimestamp * 1000).toISOString(),
      previousClose,
      changePercent,
      status: "available",
    };
  } catch (error) {
    console.error(`Failed to fetch price for ${definition.symbol}:`, error);
    return fallbackItem(definition);
  }
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const items = await Promise.all(PRICE_DEFINITIONS.map(fetchPrice));
    const availableCount = items.filter((item) => item.status === "available").length;

    return new Response(
      JSON.stringify({
        source: availableCount > 0 ? "yahoo-finance" : "fallback",
        fetchedAt: new Date().toISOString(),
        items,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    console.error("market-pricing function failed:", error);

    return new Response(
      JSON.stringify({
        source: "fallback",
        fetchedAt: new Date().toISOString(),
        items: PRICE_DEFINITIONS.map(fallbackItem),
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  }
});
