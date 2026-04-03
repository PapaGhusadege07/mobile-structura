import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import {
  type BeamDesignResult,
  type ColumnDesignResult,
  type FootingDesignResult,
  type SlabDesignResult,
  type CostEstimate,
  type CalculationStep,
} from "@/lib/structural-calculations";
import {
  Ruler, Shield, Activity, DollarSign, ArrowUpDown, Box, Target, SquareStack, ChevronDown, BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface ResultCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  unit?: string;
  status?: "safe" | "warning" | "unsafe";
  className?: string;
}

function ResultCard({ icon: Icon, label, value, unit, status, className }: ResultCardProps) {
  return (
    <div className={cn("p-4 rounded-xl bg-muted/50", className)}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 text-accent" />
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold font-mono">{value}</span>
        {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
      </div>
      {status && (
        <StatusBadge
          status={status === "safe" ? "healthy" : status === "warning" ? "warning" : "critical"}
          className="mt-2 text-xs"
        />
      )}
    </div>
  );
}

function StepByStepCalc({ steps }: { steps: CalculationStep[] }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <button className="w-full flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium">Step-by-Step Calculations ({steps.length} steps)</span>
          </div>
          <ChevronDown className={cn("w-4 h-4 transition-transform", isOpen && "rotate-180")} />
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="mt-2 space-y-3">
          {steps.map((step, i) => (
            <div key={i} className="p-3 rounded-lg bg-muted/20 border border-border/30">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold text-foreground">
                  Step {i + 1}: {step.label}
                </span>
                {step.clause && (
                  <span className="text-[10px] font-mono text-accent bg-accent/10 px-2 py-0.5 rounded">
                    {step.clause}
                  </span>
                )}
              </div>
              <div className="text-xs text-muted-foreground font-mono space-y-0.5">
                <div>{step.formula}</div>
                <div className="text-foreground/70">{step.substitution}</div>
                <div className="font-semibold text-foreground">{step.result}</div>
              </div>
            </div>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function BeamResults({ result, cost }: { result: BeamDesignResult; cost: CostEstimate }) {
  return (
    <div className="space-y-4 animate-fade-in">
      <Card variant={result.status === "safe" ? "default" : "status"}>
        {result.status !== "safe" && (
          <div className={cn("h-1", result.status === "warning" ? "bg-warning" : "bg-destructive")} />
        )}
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Ruler className="w-5 h-5 text-accent" />Beam Design Results
            </CardTitle>
            <StatusBadge
              status={result.status === "safe" ? "healthy" : result.status === "warning" ? "warning" : "critical"}
              label={result.status === "safe" ? "Design Safe" : result.status === "warning" ? "Check Required" : "Redesign Needed"}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />Reinforcement Details
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-primary/5 rounded-lg">
                <div className="text-xs text-muted-foreground">Tension Bars</div>
                <div className="font-semibold font-mono">{result.reinforcement.tensionBars}</div>
                <div className="text-xs text-muted-foreground">Ast = {result.reinforcement.tensionArea} mm²</div>
              </div>
              <div className="p-3 bg-primary/5 rounded-lg">
                <div className="text-xs text-muted-foreground">Compression Bars</div>
                <div className="font-semibold font-mono">{result.reinforcement.compressionBars}</div>
                <div className="text-xs text-muted-foreground">Asc = {result.reinforcement.compressionArea} mm²</div>
              </div>
              <div className="col-span-2 p-3 bg-accent/5 rounded-lg">
                <div className="text-xs text-muted-foreground">Stirrups (Shear Reinforcement)</div>
                <div className="font-semibold font-mono">{result.reinforcement.stirrups}</div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <ResultCard icon={Activity} label="Ultimate Moment" value={result.moments.ultimate} unit="kNm" />
            <ResultCard icon={Target} label="Moment Capacity" value={result.moments.resistance} unit="kNm"
              status={result.moments.ultimate <= result.moments.resistance ? "safe" : "unsafe"} />
            <ResultCard icon={ArrowUpDown} label="Deflection" value={result.deflection.calculated} unit="mm" />
            <ResultCard icon={ArrowUpDown} label="Allowable" value={result.deflection.allowable} unit="mm"
              status={result.deflection.calculated <= result.deflection.allowable ? "safe" : "unsafe"} />
          </div>
          {result.steps && <StepByStepCalc steps={result.steps} />}
        </CardContent>
      </Card>
      <CostCard cost={cost} />
    </div>
  );
}

export function ColumnResults({ result, cost }: { result: ColumnDesignResult; cost: CostEstimate }) {
  return (
    <div className="space-y-4 animate-fade-in">
      <Card variant={result.status === "safe" ? "default" : "status"}>
        {result.status !== "safe" && (
          <div className={cn("h-1", result.status === "warning" ? "bg-warning" : "bg-destructive")} />
        )}
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Box className="w-5 h-5 text-accent" />Column Design Results
            </CardTitle>
            <StatusBadge status={result.status === "safe" ? "healthy" : result.status === "warning" ? "warning" : "critical"} />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-3">Reinforcement Details</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-primary/5 rounded-lg">
                <div className="text-xs text-muted-foreground">Main Bars</div>
                <div className="font-semibold font-mono">{result.reinforcement.mainBars}</div>
                <div className="text-xs text-muted-foreground">Asc = {result.reinforcement.mainArea} mm²</div>
              </div>
              <div className="p-3 bg-primary/5 rounded-lg">
                <div className="text-xs text-muted-foreground">Steel %</div>
                <div className="font-semibold font-mono text-2xl">{result.reinforcement.percentage}%</div>
                <div className="text-xs text-muted-foreground">Min 0.8%, Max 6%</div>
              </div>
              <div className="col-span-2 p-3 bg-accent/5 rounded-lg">
                <div className="text-xs text-muted-foreground">Ties (Lateral Reinforcement)</div>
                <div className="font-semibold font-mono">{result.reinforcement.ties}</div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <ResultCard icon={ArrowUpDown} label="Axial Capacity" value={result.capacity.axial} unit="kN" />
            <ResultCard icon={Activity} label="Moment X" value={result.capacity.momentX} unit="kNm" />
            <ResultCard icon={Activity} label="Moment Y" value={result.capacity.momentY} unit="kNm" />
          </div>
          <div className="p-3 bg-muted/50 rounded-lg flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">Slenderness Ratio</div>
              <div className="text-xs text-muted-foreground">λ = {result.slenderness.ratio}</div>
              {result.slenderness.additionalMoment > 0 && (
                <div className="text-xs text-warning">Additional Moment: {result.slenderness.additionalMoment} kNm</div>
              )}
            </div>
            <StatusBadge
              status={result.slenderness.classification === "short" ? "healthy" : "warning"}
              label={result.slenderness.classification === "short" ? "Short Column" : "Slender Column"}
            />
          </div>
          {result.steps && <StepByStepCalc steps={result.steps} />}
        </CardContent>
      </Card>
      <CostCard cost={cost} />
    </div>
  );
}

export function FootingResults({ result, cost }: { result: FootingDesignResult; cost: CostEstimate }) {
  return (
    <div className="space-y-4 animate-fade-in">
      <Card variant={result.status === "safe" ? "default" : "status"}>
        {result.status !== "safe" && (
          <div className={cn("h-1", result.status === "warning" ? "bg-warning" : "bg-destructive")} />
        )}
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Box className="w-5 h-5 text-accent" />Footing Design Results
            </CardTitle>
            <StatusBadge status={result.status === "safe" ? "healthy" : result.status === "warning" ? "warning" : "critical"} />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-3">Footing Dimensions</h4>
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-primary/5 rounded-lg text-center">
                <div className="text-xs text-muted-foreground">Length</div>
                <div className="font-semibold font-mono text-xl">{result.dimensions.length}</div>
                <div className="text-xs text-muted-foreground">mm</div>
              </div>
              <div className="p-3 bg-primary/5 rounded-lg text-center">
                <div className="text-xs text-muted-foreground">Width</div>
                <div className="font-semibold font-mono text-xl">{result.dimensions.width}</div>
                <div className="text-xs text-muted-foreground">mm</div>
              </div>
              <div className="p-3 bg-primary/5 rounded-lg text-center">
                <div className="text-xs text-muted-foreground">Depth</div>
                <div className="font-semibold font-mono text-xl">{result.dimensions.depth}</div>
                <div className="text-xs text-muted-foreground">mm</div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-accent/5 rounded-lg">
              <div className="text-xs text-muted-foreground">Reinforcement X</div>
              <div className="font-semibold font-mono">{result.reinforcement.mainBarsX}</div>
            </div>
            <div className="p-3 bg-accent/5 rounded-lg">
              <div className="text-xs text-muted-foreground">Reinforcement Y</div>
              <div className="font-semibold font-mono">{result.reinforcement.mainBarsY}</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <ResultCard icon={ArrowUpDown} label="Soil Pressure" value={result.pressure.actual} unit="kN/m²"
              status={result.pressure.actual <= result.pressure.allowable ? "safe" : "unsafe"} />
            <ResultCard icon={Target} label="Allowable SBC" value={result.pressure.allowable} unit="kN/m²" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <ResultCard icon={Shield} label="Punching Shear" value={result.punchingShear.calculated} unit="kN"
              status={result.punchingShear.calculated <= result.punchingShear.resistance ? "safe" : "unsafe"} />
            <ResultCard icon={Shield} label="One-Way Shear" value={result.oneWayShear.calculated} unit="kN"
              status={result.oneWayShear.calculated <= result.oneWayShear.resistance ? "safe" : "unsafe"} />
          </div>
          {result.steps && <StepByStepCalc steps={result.steps} />}
        </CardContent>
      </Card>
      <CostCard cost={cost} />
    </div>
  );
}

export function SlabResults({ result, cost }: { result: SlabDesignResult; cost: CostEstimate }) {
  return (
    <div className="space-y-4 animate-fade-in">
      <Card variant={result.status === "safe" ? "default" : "status"}>
        {result.status !== "safe" && (
          <div className={cn("h-1", result.status === "warning" ? "bg-warning" : "bg-destructive")} />
        )}
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <SquareStack className="w-5 h-5 text-accent" />
              Slab Design Results
            </CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono bg-accent/10 text-accent px-2 py-0.5 rounded">
                {result.slabType.toUpperCase()}
              </span>
              <StatusBadge status={result.status === "safe" ? "healthy" : result.status === "warning" ? "warning" : "critical"} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-primary/5 rounded-lg text-center">
              <div className="text-xs text-muted-foreground">Slab Thickness</div>
              <div className="font-semibold font-mono text-xl">{result.thickness}</div>
              <div className="text-xs text-muted-foreground">mm</div>
            </div>
            <div className="p-3 bg-primary/5 rounded-lg text-center">
              <div className="text-xs text-muted-foreground">Effective Depth</div>
              <div className="font-semibold font-mono text-xl">{result.effectiveDepth}</div>
              <div className="text-xs text-muted-foreground">mm</div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />Reinforcement
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-accent/5 rounded-lg">
                <div className="text-xs text-muted-foreground">Short Span (Lx)</div>
                <div className="font-semibold font-mono">{result.reinforcement.shortSpanBars}</div>
                <div className="text-xs text-muted-foreground">Ast = {result.reinforcement.shortSpanArea} mm²/m</div>
              </div>
              <div className="p-3 bg-accent/5 rounded-lg">
                <div className="text-xs text-muted-foreground">{result.slabType === "one-way" ? "Distribution" : "Long Span (Ly)"}</div>
                <div className="font-semibold font-mono">{result.reinforcement.longSpanBars}</div>
                <div className="text-xs text-muted-foreground">Ast = {result.reinforcement.longSpanArea} mm²/m</div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-3">Bending Moments (kNm/m)</h4>
            <div className="grid grid-cols-2 gap-3">
              <ResultCard icon={Activity} label="Mx+ (Short +ve)" value={result.moments.shortSpanPositive} unit="kNm/m" />
              <ResultCard icon={Activity} label="Mx- (Short -ve)" value={result.moments.shortSpanNegative} unit="kNm/m" />
              {result.slabType === "two-way" && (
                <>
                  <ResultCard icon={Activity} label="My+ (Long +ve)" value={result.moments.longSpanPositive} unit="kNm/m" />
                  <ResultCard icon={Activity} label="My- (Long -ve)" value={result.moments.longSpanNegative} unit="kNm/m" />
                </>
              )}
            </div>
          </div>

          <div className="p-3 bg-muted/50 rounded-lg flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">Deflection Check (L/d)</div>
              <div className="text-xs text-muted-foreground">
                Actual: {result.deflection.spanDepthRatio} | Allowable: {result.deflection.allowableRatio}
              </div>
            </div>
            <StatusBadge
              status={result.deflection.spanDepthRatio <= result.deflection.allowableRatio ? "healthy" : "critical"}
              label={result.deflection.spanDepthRatio <= result.deflection.allowableRatio ? "OK" : "Fails"}
            />
          </div>

          {result.steps && <StepByStepCalc steps={result.steps} />}
        </CardContent>
      </Card>
      <CostCard cost={cost} />
    </div>
  );
}

function CostCard({ cost }: { cost: CostEstimate }) {
  return (
    <Card variant="elevated">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <DollarSign className="w-5 h-5 text-success" />Cost Estimate
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Object.entries(cost.materials).map(([key, item]) => (
            <div key={key} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground capitalize">{key}</span>
              <div className="flex items-center gap-4">
                <span className="font-mono text-xs text-muted-foreground">
                  {item.quantity} {item.unit} × ₹{item.rate}
                </span>
                <span className="font-semibold font-mono">₹{item.cost.toLocaleString()}</span>
              </div>
            </div>
          ))}
          <div className="flex items-center justify-between text-sm border-t pt-2">
            <span className="text-muted-foreground">Labor (35%)</span>
            <span className="font-semibold font-mono">₹{cost.labor.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between pt-2 border-t">
            <span className="font-semibold">Total Estimated Cost</span>
            <span className="text-xl font-bold font-mono text-success">₹{cost.total.toLocaleString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
