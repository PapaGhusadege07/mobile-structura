import { useState, useRef } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
  slabInputSchema,
  edgeConditionLabels,
  type BeamInput,
  type ColumnInput,
  type FootingInput,
  type SlabInput,
} from "@/lib/structural-calculations";
import { Ruler, Layers, Box, AlertCircle, SquareStack } from "lucide-react";
import { cn } from "@/lib/utils";

function InputField({
  label, name, value, onChange, unit, error,
}: {
  label: string; name: string; value: number; onChange: (v: number) => void; unit: string; error?: string;
}) {
  const [localValue, setLocalValue] = useState<string>(String(value));
  const prevValue = useRef(value);
  if (prevValue.current !== value && String(value) !== localValue) {
    setLocalValue(String(value));
  }
  prevValue.current = value;

  return (
    <div className="space-y-2">
      <Label htmlFor={name} className="text-sm font-medium">{label}</Label>
      <div className="relative">
        <Input
          id={name} type="text" inputMode="decimal" value={localValue}
          onChange={(e) => { const raw = e.target.value; if (/^-?\d*\.?\d*$/.test(raw) || raw === '') setLocalValue(raw); }}
          onBlur={() => { const num = parseFloat(localValue) || 0; setLocalValue(String(num)); onChange(num); }}
          className={cn("pr-12 font-mono", error && "border-destructive")}
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">{unit}</span>
      </div>
      {error && (
        <div className="flex items-center gap-1 text-destructive text-xs">
          <AlertCircle className="w-3 h-3" />{error}
        </div>
      )}
    </div>
  );
}

function GradeSelect({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: string[];
}) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>
          {options.map((opt) => (<SelectItem key={opt} value={opt}>{opt}</SelectItem>))}
        </SelectContent>
      </Select>
    </div>
  );
}

interface DesignInputFormProps {
  onBeamSubmit: (data: BeamInput) => void;
  onColumnSubmit: (data: ColumnInput) => void;
  onFootingSubmit: (data: FootingInput) => void;
  onSlabSubmit: (data: SlabInput) => void;
}

export function DesignInputForm({ onBeamSubmit, onColumnSubmit, onFootingSubmit, onSlabSubmit }: DesignInputFormProps) {
  const [activeTab, setActiveTab] = useState("beam");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [beamData, setBeamData] = useState<BeamInput>({
    spanLength: 5, width: 300, depth: 450, deadLoad: 15, liveLoad: 10,
    concreteGrade: "M25", steelGrade: "Fe500", beamType: "simply_supported",
  });

  const [columnData, setColumnData] = useState<ColumnInput>({
    height: 3, width: 400, depth: 400, axialLoad: 800, momentX: 50, momentY: 50,
    concreteGrade: "M30", steelGrade: "Fe500", endCondition: "fixed_fixed",
  });

  const [footingData, setFootingData] = useState<FootingInput>({
    columnWidth: 400, columnDepth: 400, axialLoad: 800, soilBearingCapacity: 150,
    concreteGrade: "M25", steelGrade: "Fe500",
  });

  const [slabData, setSlabData] = useState<SlabInput>({
    spanLx: 4, spanLy: 5, liveLoad: 3, floorFinish: 1.0,
    concreteGrade: "M25", steelGrade: "Fe500", edgeCondition: "all_edges_simply_supported",
  });

  function validate<T>(schema: { safeParse: (d: T) => any }, data: T, onSuccess: (d: T) => void) {
    const result = schema.safeParse(data);
    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.errors.forEach((err: any) => { newErrors[err.path[0]] = err.message; });
      setErrors(newErrors);
      return;
    }
    setErrors({});
    onSuccess(result.data);
  }

  return (
    <Card variant="elevated" className="w-full">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <CardHeader className="pb-2">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="beam" className="flex items-center gap-1 text-xs">
              <Ruler className="w-3.5 h-3.5" />Beam
            </TabsTrigger>
            <TabsTrigger value="column" className="flex items-center gap-1 text-xs">
              <Layers className="w-3.5 h-3.5" />Column
            </TabsTrigger>
            <TabsTrigger value="footing" className="flex items-center gap-1 text-xs">
              <Box className="w-3.5 h-3.5" />Footing
            </TabsTrigger>
            <TabsTrigger value="slab" className="flex items-center gap-1 text-xs">
              <SquareStack className="w-3.5 h-3.5" />Slab
            </TabsTrigger>
          </TabsList>
        </CardHeader>

        <CardContent className="pt-4">
          {/* Beam Tab */}
          <TabsContent value="beam" className="mt-0 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <GradeSelect label="Beam Type" value={beamData.beamType || "simply_supported"}
                onChange={(v) => setBeamData({ ...beamData, beamType: v as BeamInput["beamType"] })}
                options={["simply_supported", "cantilever", "continuous"]} />
              <InputField label="Span Length" name="spanLength" value={beamData.spanLength}
                onChange={(v) => setBeamData({ ...beamData, spanLength: v })} unit="m" error={errors.spanLength} />
              <InputField label="Width" name="width" value={beamData.width}
                onChange={(v) => setBeamData({ ...beamData, width: v })} unit="mm" error={errors.width} />
              <InputField label="Depth" name="depth" value={beamData.depth}
                onChange={(v) => setBeamData({ ...beamData, depth: v })} unit="mm" error={errors.depth} />
              <InputField label="Dead Load" name="deadLoad" value={beamData.deadLoad}
                onChange={(v) => setBeamData({ ...beamData, deadLoad: v })} unit="kN/m" error={errors.deadLoad} />
              <InputField label="Live Load" name="liveLoad" value={beamData.liveLoad}
                onChange={(v) => setBeamData({ ...beamData, liveLoad: v })} unit="kN/m" error={errors.liveLoad} />
              <GradeSelect label="Concrete" value={beamData.concreteGrade}
                onChange={(v) => setBeamData({ ...beamData, concreteGrade: v as BeamInput["concreteGrade"] })}
                options={["M20", "M25", "M30", "M35", "M40"]} />
              <GradeSelect label="Steel" value={beamData.steelGrade}
                onChange={(v) => setBeamData({ ...beamData, steelGrade: v as BeamInput["steelGrade"] })}
                options={["Fe415", "Fe500", "Fe550"]} />
            </div>
            <Button variant="hero" className="w-full" onClick={() => validate(beamInputSchema, beamData, onBeamSubmit)}>
              Calculate Beam Design
            </Button>
          </TabsContent>

          {/* Column Tab */}
          <TabsContent value="column" className="mt-0 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <GradeSelect label="End Condition" value={columnData.endCondition || "fixed_fixed"}
                onChange={(v) => setColumnData({ ...columnData, endCondition: v as ColumnInput["endCondition"] })}
                options={["fixed_fixed", "fixed_hinged", "hinged_hinged", "fixed_free"]} />
              <InputField label="Height" name="height" value={columnData.height}
                onChange={(v) => setColumnData({ ...columnData, height: v })} unit="m" error={errors.height} />
              <InputField label="Width" name="width" value={columnData.width}
                onChange={(v) => setColumnData({ ...columnData, width: v })} unit="mm" error={errors.width} />
              <InputField label="Depth" name="depth" value={columnData.depth}
                onChange={(v) => setColumnData({ ...columnData, depth: v })} unit="mm" error={errors.depth} />
              <InputField label="Axial Load" name="axialLoad" value={columnData.axialLoad}
                onChange={(v) => setColumnData({ ...columnData, axialLoad: v })} unit="kN" error={errors.axialLoad} />
              <InputField label="Moment X" name="momentX" value={columnData.momentX}
                onChange={(v) => setColumnData({ ...columnData, momentX: v })} unit="kNm" error={errors.momentX} />
              <InputField label="Moment Y" name="momentY" value={columnData.momentY}
                onChange={(v) => setColumnData({ ...columnData, momentY: v })} unit="kNm" error={errors.momentY} />
              <GradeSelect label="Concrete" value={columnData.concreteGrade}
                onChange={(v) => setColumnData({ ...columnData, concreteGrade: v as ColumnInput["concreteGrade"] })}
                options={["M20", "M25", "M30", "M35", "M40"]} />
              <GradeSelect label="Steel" value={columnData.steelGrade}
                onChange={(v) => setColumnData({ ...columnData, steelGrade: v as ColumnInput["steelGrade"] })}
                options={["Fe415", "Fe500", "Fe550"]} />
            </div>
            <Button variant="hero" className="w-full" onClick={() => validate(columnInputSchema, columnData, onColumnSubmit)}>
              Calculate Column Design
            </Button>
          </TabsContent>

          {/* Footing Tab */}
          <TabsContent value="footing" className="mt-0 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <InputField label="Column Width" name="columnWidth" value={footingData.columnWidth}
                onChange={(v) => setFootingData({ ...footingData, columnWidth: v })} unit="mm" error={errors.columnWidth} />
              <InputField label="Column Depth" name="columnDepth" value={footingData.columnDepth}
                onChange={(v) => setFootingData({ ...footingData, columnDepth: v })} unit="mm" error={errors.columnDepth} />
              <InputField label="Axial Load" name="axialLoad" value={footingData.axialLoad}
                onChange={(v) => setFootingData({ ...footingData, axialLoad: v })} unit="kN" error={errors.axialLoad} />
              <InputField label="Soil Bearing Capacity" name="soilBearingCapacity" value={footingData.soilBearingCapacity}
                onChange={(v) => setFootingData({ ...footingData, soilBearingCapacity: v })} unit="kN/m²" error={errors.soilBearingCapacity} />
              <GradeSelect label="Concrete" value={footingData.concreteGrade}
                onChange={(v) => setFootingData({ ...footingData, concreteGrade: v as FootingInput["concreteGrade"] })}
                options={["M20", "M25", "M30", "M35", "M40"]} />
              <GradeSelect label="Steel" value={footingData.steelGrade}
                onChange={(v) => setFootingData({ ...footingData, steelGrade: v as FootingInput["steelGrade"] })}
                options={["Fe415", "Fe500", "Fe550"]} />
            </div>
            <Button variant="hero" className="w-full" onClick={() => validate(footingInputSchema, footingData, onFootingSubmit)}>
              Calculate Footing Design
            </Button>
          </TabsContent>

          {/* Slab Tab */}
          <TabsContent value="slab" className="mt-0 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <InputField label="Short Span (Lx)" name="spanLx" value={slabData.spanLx}
                onChange={(v) => setSlabData({ ...slabData, spanLx: v })} unit="m" error={errors.spanLx} />
              <InputField label="Long Span (Ly)" name="spanLy" value={slabData.spanLy}
                onChange={(v) => setSlabData({ ...slabData, spanLy: v })} unit="m" error={errors.spanLy} />
              <InputField label="Live Load" name="liveLoad" value={slabData.liveLoad}
                onChange={(v) => setSlabData({ ...slabData, liveLoad: v })} unit="kN/m²" error={errors.liveLoad} />
              <InputField label="Floor Finish" name="floorFinish" value={slabData.floorFinish || 1.0}
                onChange={(v) => setSlabData({ ...slabData, floorFinish: v })} unit="kN/m²" error={errors.floorFinish} />
              <div className="col-span-2">
                <GradeSelect label="Edge Condition" value={slabData.edgeCondition}
                  onChange={(v) => setSlabData({ ...slabData, edgeCondition: v as SlabInput["edgeCondition"] })}
                  options={Object.keys(edgeConditionLabels)} />
              </div>
              <GradeSelect label="Concrete" value={slabData.concreteGrade}
                onChange={(v) => setSlabData({ ...slabData, concreteGrade: v as SlabInput["concreteGrade"] })}
                options={["M20", "M25", "M30", "M35", "M40"]} />
              <GradeSelect label="Steel" value={slabData.steelGrade}
                onChange={(v) => setSlabData({ ...slabData, steelGrade: v as SlabInput["steelGrade"] })}
                options={["Fe415", "Fe500", "Fe550"]} />
            </div>
            <Button variant="hero" className="w-full" onClick={() => validate(slabInputSchema, slabData, onSlabSubmit)}>
              Calculate Slab Design
            </Button>
          </TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  );
}
