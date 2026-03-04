import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { materials, categories, regions, type MaterialCategory } from "@/lib/market-data";
import { Search, TrendingUp, TrendingDown, Minus, MapPin, Filter } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function MarketPriceView() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedRegion, setSelectedRegion] = useState<string>("all");

  const filtered = useMemo(() => {
    return materials.filter((m) => {
      const matchSearch = m.name.toLowerCase().includes(search.toLowerCase());
      const matchCategory = selectedCategory === "all" || m.category === selectedCategory;
      const matchRegion = selectedRegion === "all" || m.region === selectedRegion;
      return matchSearch && matchCategory && matchRegion;
    });
  }, [search, selectedCategory, selectedRegion]);

  const stats = useMemo(() => {
    const up = materials.filter(m => m.priceChange > 0).length;
    const down = materials.filter(m => m.priceChange < 0).length;
    return { total: materials.length, up, down, stable: materials.length - up - down };
  }, []);

  return (
    <div className="pb-24 px-4 pt-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Material Prices</h1>
        <p className="text-sm text-muted-foreground">Live construction material rates</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        <Card variant="glass" className="p-3 text-center">
          <div className="text-lg font-bold text-foreground">{stats.total}</div>
          <div className="text-[10px] text-muted-foreground">Materials</div>
        </Card>
        <Card variant="glass" className="p-3 text-center">
          <div className="text-lg font-bold text-green-500">{stats.up}</div>
          <div className="text-[10px] text-muted-foreground">Price Up</div>
        </Card>
        <Card variant="glass" className="p-3 text-center">
          <div className="text-lg font-bold text-red-500">{stats.down}</div>
          <div className="text-[10px] text-muted-foreground">Price Down</div>
        </Card>
        <Card variant="glass" className="p-3 text-center">
          <div className="text-lg font-bold text-muted-foreground">{stats.stable}</div>
          <div className="text-[10px] text-muted-foreground">Stable</div>
        </Card>
      </div>

      {/* Search */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search materials..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4">
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="flex-1 h-9 text-xs">
            <Filter className="w-3 h-3 mr-1" />
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(c => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedRegion} onValueChange={setSelectedRegion}>
          <SelectTrigger className="flex-1 h-9 text-xs">
            <MapPin className="w-3 h-3 mr-1" />
            <SelectValue placeholder="Region" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Regions</SelectItem>
            {regions.map(r => (
              <SelectItem key={r.id} value={r.city}>{r.city}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Category Pills */}
      <div className="flex gap-1.5 overflow-x-auto pb-3 mb-2 scrollbar-hide">
        <Badge
          variant={selectedCategory === "all" ? "default" : "outline"}
          className="cursor-pointer shrink-0 text-xs"
          onClick={() => setSelectedCategory("all")}
        >
          All
        </Badge>
        {categories.map(c => (
          <Badge
            key={c}
            variant={selectedCategory === c ? "default" : "outline"}
            className="cursor-pointer shrink-0 text-xs whitespace-nowrap"
            onClick={() => setSelectedCategory(c)}
          >
            {c}
          </Badge>
        ))}
      </div>

      {/* Materials List */}
      <div className="space-y-2">
        {filtered.map((m) => (
          <Card key={m.id} variant="glass" className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-sm text-foreground truncate">{m.name}</h3>
                  <Badge variant="secondary" className="text-[10px] shrink-0">{m.category.split(" ")[0]}</Badge>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground">{m.supplier}</span>
                  <span className="text-[10px] text-muted-foreground">• {m.region}</span>
                </div>
              </div>
              <div className="text-right ml-3">
                <div className="font-bold text-foreground">₹{m.currentPrice.toLocaleString()}</div>
                <div className="text-[10px] text-muted-foreground">per {m.unit}</div>
                <div className={`flex items-center justify-end gap-0.5 text-xs font-medium ${
                  m.priceChange > 0 ? "text-green-500" : m.priceChange < 0 ? "text-red-500" : "text-muted-foreground"
                }`}>
                  {m.priceChange > 0 ? <TrendingUp className="w-3 h-3" /> :
                   m.priceChange < 0 ? <TrendingDown className="w-3 h-3" /> :
                   <Minus className="w-3 h-3" />}
                  {Math.abs(m.priceChange).toFixed(1)}%
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>No materials found</p>
        </div>
      )}
    </div>
  );
}
