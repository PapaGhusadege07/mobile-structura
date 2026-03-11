import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, IndianRupee, Loader2 } from "lucide-react";

interface Region {
  id: string;
  city: string;
  state: string;
}

interface PricingItem {
  id: string;
  service_name: string;
  price: number;
  currency: string;
  description: string | null;
}

export function RegionPricingView() {
  const [regions, setRegions] = useState<Region[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [pricing, setPricing] = useState<PricingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRegions() {
      const { data } = await supabase
        .from("regions")
        .select("id, city, state")
        .eq("is_active", true)
        .order("city");
      if (data && data.length > 0) {
        setRegions(data);
        const bangalore = data.find((r) => r.city === "Bangalore");
        setSelectedRegion(bangalore?.id || data[0].id);
      }
      setLoading(false);
    }
    fetchRegions();
  }, []);

  useEffect(() => {
    if (!selectedRegion) return;
    async function fetchPricing() {
      setLoading(true);
      const { data } = await supabase
        .from("region_pricing")
        .select("id, service_name, price, currency, description")
        .eq("region_id", selectedRegion)
        .order("service_name");
      setPricing(data || []);
      setLoading(false);
    }
    fetchPricing();
  }, [selectedRegion]);

  const selectedCity = regions.find((r) => r.id === selectedRegion);

  return (
    <div className="pb-24 px-4 pt-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Region Pricing</h1>
        <p className="text-sm text-muted-foreground">
          Service pricing by city across India
        </p>
      </div>

      {/* Region Selector */}
      <div className="mb-6">
        <Select value={selectedRegion} onValueChange={setSelectedRegion}>
          <SelectTrigger className="w-full">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              <SelectValue placeholder="Select a city" />
            </div>
          </SelectTrigger>
          <SelectContent>
            {regions.map((r) => (
              <SelectItem key={r.id} value={r.id}>
                {r.city}, {r.state}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* City Quick Chips */}
      <div className="flex flex-wrap gap-2 mb-6">
        {regions.map((r) => (
          <button
            key={r.id}
            onClick={() => setSelectedRegion(r.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              selectedRegion === r.id
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {r.city}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : pricing.length === 0 ? (
        <Card variant="glass">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">
              No pricing available for this region yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Header */}
          {selectedCity && (
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-accent" />
              <span className="text-lg font-semibold text-foreground">
                {selectedCity.city}
              </span>
              <Badge variant="secondary" className="text-[10px]">
                {pricing.length} services
              </Badge>
            </div>
          )}

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {pricing.map((item) => (
              <Card key={item.id} variant="glass" className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground text-sm">
                        {item.service_name}
                      </h3>
                      {item.description && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {item.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 ml-3">
                      <IndianRupee className="w-4 h-4 text-primary" />
                      <span className="text-xl font-bold text-foreground">
                        {item.price.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
