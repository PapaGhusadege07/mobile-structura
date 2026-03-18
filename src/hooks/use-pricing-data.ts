import { useQuery } from "@tanstack/react-query";
import { fetchPricingData } from "@/lib/pricing-api";

export function usePricingData() {
  return useQuery({
    queryKey: ["market-pricing"],
    queryFn: fetchPricingData,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(800 * 2 ** attemptIndex, 3000),
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 10,
    refetchInterval: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    placeholderData: (previousData) => previousData,
  });
}
