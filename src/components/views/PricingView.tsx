import { useMemo, useState } from "react";
import { AlertTriangle, RefreshCcw, Search } from "lucide-react";
import { AnimatedPage } from "@/components/AnimatedPage";
import { PricingCard } from "@/components/pricing/PricingCard";
import { PricingSkeleton } from "@/components/pricing/PricingSkeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { usePricingData } from "@/hooks/use-pricing-data";
import { fallbackPricingResponse } from "@/lib/pricing-api";

export function PricingView() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const { data, isLoading, isFetching, isError, refetch } = usePricingData();

  const pricing = data ?? fallbackPricingResponse;

  const filteredItems = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();
    if (!query) return pricing.items;

    return pricing.items.filter((item) => {
      const haystack = [item.name, item.category, item.symbol, ...item.proxyFor].join(" ").toLowerCase();
      return haystack.includes(query);
    });
  }, [pricing.items, debouncedSearch]);

  const availableCount = pricing.items.filter((item) => item.status === "available").length;

  return (
    <AnimatedPage className="pb-24 px-4 pt-6 max-w-4xl mx-auto">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pricing</h1>
          <p className="text-sm text-muted-foreground">Live proxy pricing for key civil engineering cost drivers.</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{availableCount}/{pricing.items.length} live</span>
          <span>•</span>
          <span>Updated {new Date(pricing.fetchedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</span>
        </div>
      </div>

      <div className="relative mb-4">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search steel, copper, bitumen..."
          className="pl-9"
        />
      </div>

      {isError && (
        <Alert className="mb-4 border-warning/40 bg-warning/10">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Live pricing is temporarily unavailable</AlertTitle>
          <AlertDescription>
            The UI stays responsive and shows a safe fallback state instead of crashing.
          </AlertDescription>
        </Alert>
      )}

      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="text-xs text-muted-foreground">
          Source: <span className="font-medium text-foreground">{pricing.source}</span>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCcw className={isFetching ? "animate-spin h-4 w-4" : "h-4 w-4"} />
          Refresh
        </Button>
      </div>

      {isLoading ? (
        <PricingSkeleton />
      ) : filteredItems.length > 0 ? (
        <div className="space-y-3">
          {filteredItems.map((item) => (
            <PricingCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <Alert>
          <AlertTitle>No pricing results</AlertTitle>
          <AlertDescription>Try a different search term.</AlertDescription>
        </Alert>
      )}
    </AnimatedPage>
  );
}
