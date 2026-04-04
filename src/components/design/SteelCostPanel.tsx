import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  type BeamInput, type ColumnInput, type FootingInput, type SlabInput,
  type BeamDesignResult, type ColumnDesignResult, type FootingDesignResult, type SlabDesignResult,
  type CostEstimate,
} from "@/lib/structural-calculations";
import { IndianRupee, TrendingUp } from "lucide-react";

interface SteelCostPanelProps {
  type: "beam" | "column" | "footing" | "slab";
  input: BeamInput | ColumnInput | FootingInput | SlabInput;
  result: BeamDesignResult | ColumnDesignResult | FootingDesignResult | SlabDesignResult;
  cost: CostEstimate;
}

export function SteelCostPanel({ type, input, result, cost }: SteelCostPanelProps) {
  const [steelPrice, setSteelPrice] = useState(75); // ₹/kg default

  const steelQty = cost.materials.steel.quantity;

  const costBreakdown = useMemo(() => {
    const steelCost = steelQty * steelPrice;
    const concreteCost = cost.materials.concrete.cost;
    const formworkCost = cost.materials.formwork.cost;
    const materialTotal = concreteCost + steelCost + formworkCost;
    const laborCost = Math.round(materialTotal * 0.35);
    return {
      steel: { qty: steelQty, rate: steelPrice, cost: Math.round(steelCost) },
      concrete: cost.materials.concrete,
      formwork: cost.materials.formwork,
      labor: laborCost,
      total: Math.round(materialTotal + laborCost),
    };
  }, [steelPrice, steelQty, cost]);

  return (
    <Card variant="elevated">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <IndianRupee className="w-4 h-4 text-accent" />Cost Estimation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Steel Price Input */}
        <div className="p-3 rounded-lg bg-accent/10 border border-accent/20">
          <Label className="text-sm font-medium flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4" />Steel Price (₹/kg)
          </Label>
          <Input
            type="number"
            value={steelPrice}
            onChange={(e) => setSteelPrice(Math.max(0, parseFloat(e.target.value) || 0))}
            className="font-mono text-lg"
            min={0}
            step={1}
          />
          <p className="text-xs text-muted-foreground mt-1">Enter your local steel price for accurate cost</p>
        </div>

        {/* Cost Breakdown */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Concrete</span>
            <div className="flex items-center gap-4">
              <span className="font-mono text-xs text-muted-foreground">
                {costBreakdown.concrete.quantity} {costBreakdown.concrete.unit} × ₹{costBreakdown.concrete.rate}
              </span>
              <span className="font-semibold font-mono">₹{costBreakdown.concrete.cost.toLocaleString()}</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Steel</span>
            <div className="flex items-center gap-4">
              <span className="font-mono text-xs text-muted-foreground">
                {costBreakdown.steel.qty} kg × ₹{costBreakdown.steel.rate}
              </span>
              <span className="font-semibold font-mono text-accent">₹{costBreakdown.steel.cost.toLocaleString()}</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Formwork</span>
            <div className="flex items-center gap-4">
              <span className="font-mono text-xs text-muted-foreground">
                {costBreakdown.formwork.quantity} {costBreakdown.formwork.unit} × ₹{costBreakdown.formwork.rate}
              </span>
              <span className="font-semibold font-mono">₹{costBreakdown.formwork.cost.toLocaleString()}</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm border-t pt-2">
            <span className="text-muted-foreground">Labor (35%)</span>
            <span className="font-semibold font-mono">₹{costBreakdown.labor.toLocaleString()}</span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t-2 border-foreground/20">
            <span className="font-semibold text-lg">Total Cost</span>
            <span className="text-2xl font-bold font-mono text-accent">₹{costBreakdown.total.toLocaleString()}</span>
          </div>
        </div>

        {/* Steel Summary */}
        <div className="p-3 rounded-lg bg-muted/50 grid grid-cols-2 gap-3">
          <div>
            <div className="text-xs text-muted-foreground">Total Steel</div>
            <div className="font-mono text-lg font-bold">{steelQty} kg</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Steel Cost</div>
            <div className="font-mono text-lg font-bold text-accent">₹{costBreakdown.steel.cost.toLocaleString()}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
