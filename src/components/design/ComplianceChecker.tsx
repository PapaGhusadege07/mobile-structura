import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/StatusBadge";
import {
  complianceInputSchema,
  checkCompliance,
  type ComplianceInput,
  type ComplianceResult,
} from "@/lib/structural-calculations";
import { 
  Shield, 
  Wind, 
  Building2, 
  MapPin, 
  CheckCircle2, 
  XCircle,
  AlertTriangle,
  Activity
} from "lucide-react";
import { cn } from "@/lib/utils";

export function ComplianceChecker() {
  const [formData, setFormData] = useState<ComplianceInput>({
    seismicZone: "III",
    windZone: "2",
    buildingType: "residential",
    stories: 4,
    plotArea: 500,
    builtUpArea: 800,
    setbackFront: 5,
    setbackRear: 3,
    setbackSide: 2,
  });
  const [result, setResult] = useState<ComplianceResult | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleCheck = () => {
    const validation = complianceInputSchema.safeParse(formData);
    if (!validation.success) {
      const newErrors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        newErrors[String(err.path[0])] = err.message;
      });
      setErrors(newErrors);
      return;
    }
    setErrors({});
    setResult(checkCompliance(validation.data));
  };

  const ComplianceItem = ({
    label,
    required,
    provided,
    compliant,
    unit = "",
  }: {
    label: string;
    required: number;
    provided: number;
    compliant: boolean;
    unit?: string;
  }) => (
    <div className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
      <span className="text-sm">{label}</span>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <div className="text-xs text-muted-foreground">Required</div>
          <div className="font-mono text-sm">{required}{unit}</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-muted-foreground">Provided</div>
          <div className="font-mono text-sm">{provided}{unit}</div>
        </div>
        {compliant ? (
          <CheckCircle2 className="w-5 h-5 text-success" />
        ) : (
          <XCircle className="w-5 h-5 text-destructive" />
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Input Form */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-accent" />
            Compliance Parameters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Seismic Zone</Label>
              <Select
                value={formData.seismicZone}
                onValueChange={(v) => setFormData({ ...formData, seismicZone: v as ComplianceInput["seismicZone"] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="II">Zone II (Low)</SelectItem>
                  <SelectItem value="III">Zone III (Moderate)</SelectItem>
                  <SelectItem value="IV">Zone IV (Severe)</SelectItem>
                  <SelectItem value="V">Zone V (Very Severe)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Wind Zone</Label>
              <Select
                value={formData.windZone}
                onValueChange={(v) => setFormData({ ...formData, windZone: v as ComplianceInput["windZone"] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Zone 1 (33 m/s)</SelectItem>
                  <SelectItem value="2">Zone 2 (39 m/s)</SelectItem>
                  <SelectItem value="3">Zone 3 (44 m/s)</SelectItem>
                  <SelectItem value="4">Zone 4 (47 m/s)</SelectItem>
                  <SelectItem value="5">Zone 5 (50 m/s)</SelectItem>
                  <SelectItem value="6">Zone 6 (55 m/s)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Building Type</Label>
              <Select
                value={formData.buildingType}
                onValueChange={(v) => setFormData({ ...formData, buildingType: v as ComplianceInput["buildingType"] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="residential">Residential</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                  <SelectItem value="industrial">Industrial</SelectItem>
                  <SelectItem value="institutional">Institutional</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Number of Stories</Label>
              <Input
                type="number"
                value={formData.stories}
                onChange={(e) => setFormData({ ...formData, stories: parseInt(e.target.value) || 1 })}
                className="font-mono"
              />
            </div>

            <div className="space-y-2">
              <Label>Plot Area (m²)</Label>
              <Input
                type="number"
                value={formData.plotArea}
                onChange={(e) => setFormData({ ...formData, plotArea: parseFloat(e.target.value) || 0 })}
                className="font-mono"
              />
            </div>

            <div className="space-y-2">
              <Label>Total Built-up Area (m²)</Label>
              <Input
                type="number"
                value={formData.builtUpArea}
                onChange={(e) => setFormData({ ...formData, builtUpArea: parseFloat(e.target.value) || 0 })}
                className="font-mono"
              />
            </div>
          </div>

          <div className="pt-2">
            <Label className="text-sm font-medium mb-3 block">Setbacks (meters)</Label>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Front</Label>
                <Input
                  type="number"
                  value={formData.setbackFront}
                  onChange={(e) => setFormData({ ...formData, setbackFront: parseFloat(e.target.value) || 0 })}
                  className="font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Rear</Label>
                <Input
                  type="number"
                  value={formData.setbackRear}
                  onChange={(e) => setFormData({ ...formData, setbackRear: parseFloat(e.target.value) || 0 })}
                  className="font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Side</Label>
                <Input
                  type="number"
                  value={formData.setbackSide}
                  onChange={(e) => setFormData({ ...formData, setbackSide: parseFloat(e.target.value) || 0 })}
                  className="font-mono"
                />
              </div>
            </div>
          </div>

          <Button variant="hero" className="w-full" onClick={handleCheck}>
            Check Compliance
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <div className="space-y-4 animate-fade-in">
          {/* Overall Status */}
          <Card variant="status">
            <div className={cn(
              "h-1",
              result.overallStatus === "compliant" && "bg-success",
              result.overallStatus === "partial" && "bg-warning",
              result.overallStatus === "non-compliant" && "bg-destructive"
            )} />
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {result.overallStatus === "compliant" ? (
                    <CheckCircle2 className="w-8 h-8 text-success" />
                  ) : result.overallStatus === "partial" ? (
                    <AlertTriangle className="w-8 h-8 text-warning" />
                  ) : (
                    <XCircle className="w-8 h-8 text-destructive" />
                  )}
                  <div>
                    <div className="font-semibold">
                      {result.overallStatus === "compliant" && "All Requirements Met"}
                      {result.overallStatus === "partial" && "Partial Compliance"}
                      {result.overallStatus === "non-compliant" && "Non-Compliant"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Review details below
                    </div>
                  </div>
                </div>
                <StatusBadge
                  status={result.overallStatus === "compliant" ? "healthy" : result.overallStatus === "partial" ? "warning" : "critical"}
                />
              </div>
            </CardContent>
          </Card>

          {/* Seismic Analysis */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="w-4 h-4 text-accent" />
                Seismic Analysis (IS 1893)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="text-xs text-muted-foreground">Zone Factor</div>
                  <div className="font-bold font-mono text-lg">{result.seismic.zoneFactor}</div>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="text-xs text-muted-foreground">Response Factor</div>
                  <div className="font-bold font-mono text-lg">{result.seismic.responseFactor}</div>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="text-xs text-muted-foreground">Base Shear</div>
                  <div className="font-bold font-mono text-lg">{result.seismic.baseShear} kN</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Wind Analysis */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Wind className="w-4 h-4 text-accent" />
                Wind Load Analysis (IS 875)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="text-xs text-muted-foreground">Basic Wind Speed</div>
                  <div className="font-bold font-mono text-lg">{result.wind.basicSpeed} m/s</div>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="text-xs text-muted-foreground">Design Pressure</div>
                  <div className="font-bold font-mono text-lg">{result.wind.designPressure} kN/m²</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Building Bylaws */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 className="w-4 h-4 text-accent" />
                Building Bylaws Compliance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <ComplianceItem
                label="Floor Area Ratio (FAR)"
                required={result.bylaws.far.required}
                provided={result.bylaws.far.provided}
                compliant={result.bylaws.far.compliant}
              />
              <ComplianceItem
                label="Ground Coverage"
                required={result.bylaws.groundCoverage.required * 100}
                provided={Math.round(result.bylaws.groundCoverage.provided * 100)}
                compliant={result.bylaws.groundCoverage.compliant}
                unit="%"
              />
              <ComplianceItem
                label="Front Setback"
                required={result.bylaws.setbacks.front.required}
                provided={result.bylaws.setbacks.front.provided}
                compliant={result.bylaws.setbacks.front.compliant}
                unit="m"
              />
              <ComplianceItem
                label="Rear Setback"
                required={result.bylaws.setbacks.rear.required}
                provided={result.bylaws.setbacks.rear.provided}
                compliant={result.bylaws.setbacks.rear.compliant}
                unit="m"
              />
              <ComplianceItem
                label="Side Setback"
                required={result.bylaws.setbacks.side.required}
                provided={result.bylaws.setbacks.side.provided}
                compliant={result.bylaws.setbacks.side.compliant}
                unit="m"
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
