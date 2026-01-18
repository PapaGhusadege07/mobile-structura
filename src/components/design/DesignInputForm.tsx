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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  beamInputSchema, 
  columnInputSchema, 
  footingInputSchema,
  type BeamInput,
  type ColumnInput,
  type FootingInput 
} from "@/lib/structural-calculations";
import { Ruler, Layers, Box, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface DesignInputFormProps {
  onBeamSubmit: (data: BeamInput) => void;
  onColumnSubmit: (data: ColumnInput) => void;
  onFootingSubmit: (data: FootingInput) => void;
}

export function DesignInputForm({ onBeamSubmit, onColumnSubmit, onFootingSubmit }: DesignInputFormProps) {
  const [activeTab, setActiveTab] = useState("beam");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Beam state
  const [beamData, setBeamData] = useState<BeamInput>({
    spanLength: 5,
    width: 300,
    depth: 450,
    deadLoad: 15,
    liveLoad: 10,
    concreteGrade: "M25",
    steelGrade: "Fe500",
  });

  // Column state
  const [columnData, setColumnData] = useState<ColumnInput>({
    height: 3,
    width: 400,
    depth: 400,
    axialLoad: 800,
    momentX: 50,
    momentY: 50,
    concreteGrade: "M30",
    steelGrade: "Fe500",
  });

  // Footing state
  const [footingData, setFootingData] = useState<FootingInput>({
    columnWidth: 400,
    columnDepth: 400,
    axialLoad: 800,
    soilBearingCapacity: 150,
    concreteGrade: "M25",
    steelGrade: "Fe500",
  });

  const handleBeamSubmit = () => {
    const result = beamInputSchema.safeParse(beamData);
    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        newErrors[err.path[0]] = err.message;
      });
      setErrors(newErrors);
      return;
    }
    setErrors({});
    onBeamSubmit(result.data);
  };

  const handleColumnSubmit = () => {
    const result = columnInputSchema.safeParse(columnData);
    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        newErrors[err.path[0]] = err.message;
      });
      setErrors(newErrors);
      return;
    }
    setErrors({});
    onColumnSubmit(result.data);
  };

  const handleFootingSubmit = () => {
    const result = footingInputSchema.safeParse(footingData);
    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        newErrors[err.path[0]] = err.message;
      });
      setErrors(newErrors);
      return;
    }
    setErrors({});
    onFootingSubmit(result.data);
  };

  const InputField = ({ 
    label, 
    name, 
    value, 
    onChange, 
    unit, 
    error 
  }: { 
    label: string; 
    name: string; 
    value: number; 
    onChange: (v: number) => void; 
    unit: string;
    error?: string;
  }) => (
    <div className="space-y-2">
      <Label htmlFor={name} className="text-sm font-medium">
        {label}
      </Label>
      <div className="relative">
        <Input
          id={name}
          type="number"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className={cn("pr-12 font-mono", error && "border-destructive")}
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
          {unit}
        </span>
      </div>
      {error && (
        <div className="flex items-center gap-1 text-destructive text-xs">
          <AlertCircle className="w-3 h-3" />
          {error}
        </div>
      )}
    </div>
  );

  const GradeSelect = ({
    label,
    value,
    onChange,
    options,
  }: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    options: string[];
  }) => (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt} value={opt}>
              {opt}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <Card variant="elevated" className="w-full">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <CardHeader className="pb-2">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="beam" className="flex items-center gap-2">
              <Ruler className="w-4 h-4" />
              Beam
            </TabsTrigger>
            <TabsTrigger value="column" className="flex items-center gap-2">
              <Layers className="w-4 h-4" />
              Column
            </TabsTrigger>
            <TabsTrigger value="footing" className="flex items-center gap-2">
              <Box className="w-4 h-4" />
              Footing
            </TabsTrigger>
          </TabsList>
        </CardHeader>

        <CardContent className="pt-4">
          {/* Beam Tab */}
          <TabsContent value="beam" className="mt-0 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <InputField
                label="Span Length"
                name="spanLength"
                value={beamData.spanLength}
                onChange={(v) => setBeamData({ ...beamData, spanLength: v })}
                unit="m"
                error={errors.spanLength}
              />
              <InputField
                label="Width"
                name="width"
                value={beamData.width}
                onChange={(v) => setBeamData({ ...beamData, width: v })}
                unit="mm"
                error={errors.width}
              />
              <InputField
                label="Depth"
                name="depth"
                value={beamData.depth}
                onChange={(v) => setBeamData({ ...beamData, depth: v })}
                unit="mm"
                error={errors.depth}
              />
              <InputField
                label="Dead Load"
                name="deadLoad"
                value={beamData.deadLoad}
                onChange={(v) => setBeamData({ ...beamData, deadLoad: v })}
                unit="kN/m"
                error={errors.deadLoad}
              />
              <InputField
                label="Live Load"
                name="liveLoad"
                value={beamData.liveLoad}
                onChange={(v) => setBeamData({ ...beamData, liveLoad: v })}
                unit="kN/m"
                error={errors.liveLoad}
              />
              <GradeSelect
                label="Concrete Grade"
                value={beamData.concreteGrade}
                onChange={(v) => setBeamData({ ...beamData, concreteGrade: v as BeamInput["concreteGrade"] })}
                options={["M20", "M25", "M30", "M35", "M40"]}
              />
              <GradeSelect
                label="Steel Grade"
                value={beamData.steelGrade}
                onChange={(v) => setBeamData({ ...beamData, steelGrade: v as BeamInput["steelGrade"] })}
                options={["Fe415", "Fe500", "Fe550"]}
              />
            </div>
            <Button variant="hero" className="w-full" onClick={handleBeamSubmit}>
              Calculate Beam Design
            </Button>
          </TabsContent>

          {/* Column Tab */}
          <TabsContent value="column" className="mt-0 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <InputField
                label="Height"
                name="height"
                value={columnData.height}
                onChange={(v) => setColumnData({ ...columnData, height: v })}
                unit="m"
                error={errors.height}
              />
              <InputField
                label="Width"
                name="width"
                value={columnData.width}
                onChange={(v) => setColumnData({ ...columnData, width: v })}
                unit="mm"
                error={errors.width}
              />
              <InputField
                label="Depth"
                name="depth"
                value={columnData.depth}
                onChange={(v) => setColumnData({ ...columnData, depth: v })}
                unit="mm"
                error={errors.depth}
              />
              <InputField
                label="Axial Load"
                name="axialLoad"
                value={columnData.axialLoad}
                onChange={(v) => setColumnData({ ...columnData, axialLoad: v })}
                unit="kN"
                error={errors.axialLoad}
              />
              <InputField
                label="Moment X"
                name="momentX"
                value={columnData.momentX}
                onChange={(v) => setColumnData({ ...columnData, momentX: v })}
                unit="kNm"
                error={errors.momentX}
              />
              <InputField
                label="Moment Y"
                name="momentY"
                value={columnData.momentY}
                onChange={(v) => setColumnData({ ...columnData, momentY: v })}
                unit="kNm"
                error={errors.momentY}
              />
              <GradeSelect
                label="Concrete Grade"
                value={columnData.concreteGrade}
                onChange={(v) => setColumnData({ ...columnData, concreteGrade: v as ColumnInput["concreteGrade"] })}
                options={["M20", "M25", "M30", "M35", "M40"]}
              />
              <GradeSelect
                label="Steel Grade"
                value={columnData.steelGrade}
                onChange={(v) => setColumnData({ ...columnData, steelGrade: v as ColumnInput["steelGrade"] })}
                options={["Fe415", "Fe500", "Fe550"]}
              />
            </div>
            <Button variant="hero" className="w-full" onClick={handleColumnSubmit}>
              Calculate Column Design
            </Button>
          </TabsContent>

          {/* Footing Tab */}
          <TabsContent value="footing" className="mt-0 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <InputField
                label="Column Width"
                name="columnWidth"
                value={footingData.columnWidth}
                onChange={(v) => setFootingData({ ...footingData, columnWidth: v })}
                unit="mm"
                error={errors.columnWidth}
              />
              <InputField
                label="Column Depth"
                name="columnDepth"
                value={footingData.columnDepth}
                onChange={(v) => setFootingData({ ...footingData, columnDepth: v })}
                unit="mm"
                error={errors.columnDepth}
              />
              <InputField
                label="Axial Load"
                name="axialLoad"
                value={footingData.axialLoad}
                onChange={(v) => setFootingData({ ...footingData, axialLoad: v })}
                unit="kN"
                error={errors.axialLoad}
              />
              <InputField
                label="Soil Bearing Capacity"
                name="soilBearingCapacity"
                value={footingData.soilBearingCapacity}
                onChange={(v) => setFootingData({ ...footingData, soilBearingCapacity: v })}
                unit="kN/m²"
                error={errors.soilBearingCapacity}
              />
              <GradeSelect
                label="Concrete Grade"
                value={footingData.concreteGrade}
                onChange={(v) => setFootingData({ ...footingData, concreteGrade: v as FootingInput["concreteGrade"] })}
                options={["M20", "M25", "M30", "M35", "M40"]}
              />
              <GradeSelect
                label="Steel Grade"
                value={footingData.steelGrade}
                onChange={(v) => setFootingData({ ...footingData, steelGrade: v as FootingInput["steelGrade"] })}
                options={["Fe415", "Fe500", "Fe550"]}
              />
            </div>
            <Button variant="hero" className="w-full" onClick={handleFootingSubmit}>
              Calculate Footing Design
            </Button>
          </TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  );
}
