import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { suppliers } from "@/lib/market-data";
import { Search, Star, MapPin, Phone, Mail, CheckCircle2, ExternalLink } from "lucide-react";

export function SupplierView() {
  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () => suppliers.filter(s =>
      s.companyName.toLowerCase().includes(search.toLowerCase()) ||
      s.materials.some(m => m.toLowerCase().includes(search.toLowerCase())) ||
      s.city.toLowerCase().includes(search.toLowerCase())
    ),
    [search]
  );

  return (
    <div className="pb-24 px-4 pt-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Suppliers</h1>
        <p className="text-sm text-muted-foreground">Find & compare material suppliers</p>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search suppliers, materials, or city..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="space-y-3">
        {filtered.map(s => (
          <Card key={s.id} variant="glass" className="overflow-hidden">
            <CardContent className="p-4">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground">{s.companyName}</h3>
                    {s.verified && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{s.city}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-amber-500/10 px-2 py-1 rounded-md">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span className="text-sm font-semibold text-amber-500">{s.rating}</span>
                  <span className="text-[10px] text-muted-foreground">({s.reviews})</span>
                </div>
              </div>

              {/* Materials */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {s.materials.map(m => (
                  <Badge key={m} variant="secondary" className="text-[10px]">{m}</Badge>
                ))}
              </div>

              {/* Delivery Area */}
              <div className="text-xs text-muted-foreground mb-3">
                <span className="font-medium">Delivers to:</span> {s.deliveryArea.join(", ")}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 text-xs h-8">
                  <Phone className="w-3 h-3 mr-1" />
                  Call
                </Button>
                <Button variant="outline" size="sm" className="flex-1 text-xs h-8">
                  <Mail className="w-3 h-3 mr-1" />
                  Quote
                </Button>
                <Button size="sm" className="flex-1 text-xs h-8">
                  <ExternalLink className="w-3 h-3 mr-1" />
                  View
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>No suppliers found</p>
        </div>
      )}
    </div>
  );
}
