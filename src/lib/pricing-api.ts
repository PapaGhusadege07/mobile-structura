import { supabase } from "@/integrations/supabase/client";

export type PricingStatus = "available" | "unavailable";

export interface PricingItem {
  id: string;
  name: string;
  symbol: string;
  category: string;
  unit: string;
  price: number | null;
  currency: string;
  lastUpdated: string | null;
  previousClose: number | null;
  changePercent: number | null;
  status: PricingStatus;
  proxyFor: string[];
}

export interface PricingResponse {
  source: string;
  fetchedAt: string;
  items: PricingItem[];
}

/**
 * Example normalized API response:
 * {
 *   "source": "yahoo-finance",
 *   "fetchedAt": "2026-03-18T09:30:00.000Z",
 *   "items": [
 *     {
 *       "id": "steel-hrc",
 *       "name": "Steel Coil (HRC)",
 *       "symbol": "HRC=F",
 *       "category": "Metals",
 *       "unit": "USD / short ton",
 *       "price": 1062,
 *       "currency": "USD",
 *       "lastUpdated": "2026-03-18T09:28:00.000Z",
 *       "previousClose": 1011,
 *       "changePercent": 5.04,
 *       "status": "available",
 *       "proxyFor": ["TMT Bars", "Structural Steel"]
 *     }
 *   ]
 * }
 */
export const pricingDefinitions = [
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
] as const;

export const fallbackPricingResponse: PricingResponse = {
  source: "fallback",
  fetchedAt: new Date().toISOString(),
  items: pricingDefinitions.map((definition) => ({
    ...definition,
    price: null,
    currency: "USD",
    lastUpdated: null,
    previousClose: null,
    changePercent: null,
    status: "unavailable" as const,
  })),
};

const INVOKE_TIMEOUT_MS = 6000;

function normalizeItem(item: Partial<PricingItem>, fallback: (typeof pricingDefinitions)[number]): PricingItem {
  return {
    id: item.id ?? fallback.id,
    name: item.name ?? fallback.name,
    symbol: item.symbol ?? fallback.symbol,
    category: item.category ?? fallback.category,
    unit: item.unit ?? fallback.unit,
    price: typeof item.price === "number" ? item.price : null,
    currency: item.currency ?? "USD",
    lastUpdated: item.lastUpdated ?? null,
    previousClose: typeof item.previousClose === "number" ? item.previousClose : null,
    changePercent: typeof item.changePercent === "number" ? item.changePercent : null,
    status: item.status === "available" ? "available" : "unavailable",
    proxyFor: Array.isArray(item.proxyFor) ? item.proxyFor : [...fallback.proxyFor],
  };
}

function normalizeResponse(data: unknown): PricingResponse {
  const raw = (data ?? {}) as Partial<PricingResponse> & { items?: Partial<PricingItem>[] };

  return {
    source: raw.source ?? "unknown",
    fetchedAt: raw.fetchedAt ?? new Date().toISOString(),
    items: pricingDefinitions.map((definition) => {
      const rawItem = raw.items?.find((item) => item?.id === definition.id);
      return normalizeItem(rawItem, definition);
    }),
  };
}

async function invokeWithTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return await Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      window.setTimeout(() => reject(new Error(`Pricing request timed out after ${timeoutMs}ms`)), timeoutMs);
    }),
  ]);
}

export async function fetchPricingData(): Promise<PricingResponse> {
  const response = await invokeWithTimeout(
    supabase.functions.invoke("market-pricing", {
      body: {},
    }),
    INVOKE_TIMEOUT_MS,
  );

  const { data, error } = response as { data: unknown; error: { message?: string } | null };

  if (error) {
    throw new Error(error.message ?? "Unable to load pricing data");
  }

  return normalizeResponse(data);
}
