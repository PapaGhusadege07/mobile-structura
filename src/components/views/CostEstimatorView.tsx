import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { estimateProjectCost, regions, type CostEstimate } from "@/lib/market-data";
import { IndianRupee, Building2, Layers, Sparkles } from "lucide-react";

export function CostEstimatorView() {
  const [builtUpArea, setBuiltUpArea] = useState("");
  const [floors, setFloors] = useState("1");
  const [quality, setQuality] = useState<"basic" | "standard" | "premium">("standard");
  const [city, setCity] = useState("Mumbai");
  const [result, setResult] = useState<CostEstimate | null>(null);

  const calculate = () => {
    const area = parseFloat(builtUpArea);
    if (area > 0) {
      setResult(estimateProjectCost(area, parseInt(floors), quality, city));
    }
  };

  return (
    <div className="pb-24 px-4 pt-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Cost Estimator</h1>
        <p className="text-sm text-muted-foreground">Estimate total construction project cost</p>
      </div>

      {/* Inputs */}
      <Card variant="glass" className="mb-4">
        <CardContent className="p-4 space-y-4">
          <div>
            <Label className="text-xs">Built-up Area (sq ft)</Label>
            <Input type="number" inputMode="decimal" value={builtUpArea} onChange={e => setBuiltUpArea(e.target.value)} placeholder="e.g. 1500" className="mt-1" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Floors</Label>
              <Select value={floors} onValueChange={setFloors}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["1", "2", "3", "4", "5"].map(f => (
                    <SelectItem key={f} value={f}>{f} {parseInt(f) === 1 ? "Floor" : "Floors"}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">City</Label>
              <Select value={city} onValueChange={setCity}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {regions.map(r => (
                    <SelectItem key={r.id} value={r.city}>{r.city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Quality Selector */}
          <div>
            <Label className="text-xs mb-2 block">Construction Quality</Label>
            <div className="grid grid-cols-3 gap-2">
              {(["basic", "standard", "premium"] as const).map(q => (
                <button
                  key={q}
                  onClick={() => setQuality(q)}
                  className={`p-3 rounded-lg border text-center transition-all ${
                    quality === q
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/50"
                  }`}
                >
                  <div className="text-xs font-semibold capitalize">{q}</div>
                  <div className="text-[10px] mt-0.5">
                    {q === "basic" ? "₹1,400/sqft" : q === "standard" ? "₹1,900/sqft" : "₹2,800/sqft"}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <Button onClick={calculate} className="w-full" size="lg">
            <IndianRupee className="w-4 h-4 mr-1" />
            Estimate Cost
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <Card variant="glass" className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <IndianRupee className="w-4 h-4 text-primary" />
                <span className="text-xs text-muted-foreground">Total Cost</span>
              </div>
              <div className="text-xl font-bold text-foreground">₹{(result.totalCost / 100000).toFixed(1)}L</div>
            </Card>
            <Card variant="glass" className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Building2 className="w-4 h-4 text-accent" />
                <span className="text-xs text-muted-foreground">Per Sq Ft</span>
              </div>
              <div className="text-xl font-bold text-foreground">₹{result.costPerSqFt.toLocaleString()}</div>
            </Card>
            <Card variant="glass" className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Layers className="w-4 h-4 text-green-500" />
                <span className="text-xs text-muted-foreground">Material</span>
              </div>
              <div className="text-lg font-bold text-foreground">₹{(result.materialCost / 100000).toFixed(1)}L</div>
            </Card>
            <Card variant="glass" className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span className="text-xs text-muted-foreground">Labour</span>
              </div>
              <div className="text-lg font-bold text-foreground">₹{(result.labourCost / 100000).toFixed(1)}L</div>
            </Card>
          </div>

          {/* Detailed Breakdown */}
          <Card variant="glass">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Cost Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {result.breakdown.map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">{item.item}</span>
                    <span className="font-medium text-foreground">₹{(item.cost / 1000).toFixed(0)}K <span className="text-xs text-muted-foreground">({item.pct}%)</span></span>
                  </div>
                  <Progress value={item.pct} className="h-1.5" />
                </div>
              ))}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
