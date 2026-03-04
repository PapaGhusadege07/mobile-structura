import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { calculateConcreteMix, calculateBricks, calculatePlaster, calculateTiles } from "@/lib/market-data";
import { Calculator, Layers, Grid3X3, PaintBucket } from "lucide-react";

function ResultRow({ label, value, unit }: { label: string; value: number | string; unit: string }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-border/30 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="font-semibold text-foreground">{value} <span className="text-xs text-muted-foreground">{unit}</span></span>
    </div>
  );
}

function ConcreteCalc() {
  const [grade, setGrade] = useState("M20");
  const [volume, setVolume] = useState("");
  const [result, setResult] = useState<ReturnType<typeof calculateConcreteMix> | null>(null);

  const calc = () => {
    const v = parseFloat(volume);
    if (v > 0) setResult(calculateConcreteMix(grade, v));
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div>
          <Label className="text-xs">Concrete Grade</Label>
          <Select value={grade} onValueChange={setGrade}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              {["M5", "M10", "M15", "M20", "M25"].map(g => (
                <SelectItem key={g} value={g}>{g}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">Volume (m³)</Label>
          <Input type="number" inputMode="decimal" value={volume} onChange={e => setVolume(e.target.value)} placeholder="e.g. 10" className="mt-1" />
        </div>
        <Button onClick={calc} className="w-full" size="sm">Calculate</Button>
      </div>
      {result && (
        <Card variant="glass" className="p-4">
          <ResultRow label="Cement" value={result.cement} unit="bags" />
          <ResultRow label="Sand" value={result.sand} unit="m³" />
          <ResultRow label="Aggregate" value={result.aggregate} unit="m³" />
          <ResultRow label="Water" value={result.water} unit="litres" />
        </Card>
      )}
    </div>
  );
}

function BrickCalc() {
  const [length, setLength] = useState("");
  const [height, setHeight] = useState("");
  const [brickSize, setBrickSize] = useState<"standard" | "modular">("standard");
  const [result, setResult] = useState<ReturnType<typeof calculateBricks> | null>(null);

  const calc = () => {
    const l = parseFloat(length), h = parseFloat(height);
    if (l > 0 && h > 0) setResult(calculateBricks(l, h, brickSize));
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div>
          <Label className="text-xs">Wall Length (ft)</Label>
          <Input type="number" inputMode="decimal" value={length} onChange={e => setLength(e.target.value)} placeholder="e.g. 20" className="mt-1" />
        </div>
        <div>
          <Label className="text-xs">Wall Height (ft)</Label>
          <Input type="number" inputMode="decimal" value={height} onChange={e => setHeight(e.target.value)} placeholder="e.g. 10" className="mt-1" />
        </div>
        <div>
          <Label className="text-xs">Brick Size</Label>
          <Select value={brickSize} onValueChange={(v) => setBrickSize(v as "standard" | "modular")}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="standard">Standard (230×115×75mm)</SelectItem>
              <SelectItem value="modular">Modular (190×90×90mm)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={calc} className="w-full" size="sm">Calculate</Button>
      </div>
      {result && (
        <Card variant="glass" className="p-4">
          <ResultRow label="Bricks Required" value={result.bricks.toLocaleString()} unit="nos" />
          <ResultRow label="Mortar" value={result.mortar} unit="m³" />
          <ResultRow label="Cement" value={result.cementBags} unit="bags" />
        </Card>
      )}
    </div>
  );
}

function PlasterCalc() {
  const [area, setArea] = useState("");
  const [thickness, setThickness] = useState("12");
  const [result, setResult] = useState<ReturnType<typeof calculatePlaster> | null>(null);

  const calc = () => {
    const a = parseFloat(area), t = parseFloat(thickness);
    if (a > 0 && t > 0) setResult(calculatePlaster(a, t));
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div>
          <Label className="text-xs">Wall Area (m²)</Label>
          <Input type="number" inputMode="decimal" value={area} onChange={e => setArea(e.target.value)} placeholder="e.g. 100" className="mt-1" />
        </div>
        <div>
          <Label className="text-xs">Thickness (mm)</Label>
          <Select value={thickness} onValueChange={setThickness}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="6">6mm (Ceiling)</SelectItem>
              <SelectItem value="12">12mm (Internal)</SelectItem>
              <SelectItem value="20">20mm (External)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={calc} className="w-full" size="sm">Calculate</Button>
      </div>
      {result && (
        <Card variant="glass" className="p-4">
          <ResultRow label="Cement" value={result.cement} unit="bags" />
          <ResultRow label="Sand" value={result.sand} unit="m³" />
        </Card>
      )}
    </div>
  );
}

function TileCalc() {
  const [area, setArea] = useState("");
  const [tileW, setTileW] = useState("60");
  const [tileH, setTileH] = useState("60");
  const [result, setResult] = useState<ReturnType<typeof calculateTiles> | null>(null);

  const calc = () => {
    const a = parseFloat(area), w = parseFloat(tileW), h = parseFloat(tileH);
    if (a > 0 && w > 0 && h > 0) setResult(calculateTiles(a, w, h));
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div>
          <Label className="text-xs">Floor Area (m²)</Label>
          <Input type="number" inputMode="decimal" value={area} onChange={e => setArea(e.target.value)} placeholder="e.g. 50" className="mt-1" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs">Tile Width (cm)</Label>
            <Input type="number" inputMode="decimal" value={tileW} onChange={e => setTileW(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label className="text-xs">Tile Height (cm)</Label>
            <Input type="number" inputMode="decimal" value={tileH} onChange={e => setTileH(e.target.value)} className="mt-1" />
          </div>
        </div>
        <Button onClick={calc} className="w-full" size="sm">Calculate</Button>
      </div>
      {result && (
        <Card variant="glass" className="p-4">
          <ResultRow label="Tiles Required" value={result.tiles.toLocaleString()} unit="nos" />
          <ResultRow label="Wastage (10%)" value={result.wastage} unit="nos" />
          <ResultRow label="Total to Buy" value={result.totalTiles.toLocaleString()} unit="nos" />
        </Card>
      )}
    </div>
  );
}

export function CalculatorsView() {
  return (
    <div className="pb-24 px-4 pt-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Calculators</h1>
        <p className="text-sm text-muted-foreground">Construction quantity calculators</p>
      </div>

      <Tabs defaultValue="concrete">
        <TabsList className="w-full grid grid-cols-4 mb-4">
          <TabsTrigger value="concrete" className="text-xs gap-1"><Calculator className="w-3 h-3" />Concrete</TabsTrigger>
          <TabsTrigger value="brick" className="text-xs gap-1"><Layers className="w-3 h-3" />Brick</TabsTrigger>
          <TabsTrigger value="plaster" className="text-xs gap-1"><PaintBucket className="w-3 h-3" />Plaster</TabsTrigger>
          <TabsTrigger value="tile" className="text-xs gap-1"><Grid3X3 className="w-3 h-3" />Tile</TabsTrigger>
        </TabsList>
        <TabsContent value="concrete"><ConcreteCalc /></TabsContent>
        <TabsContent value="brick"><BrickCalc /></TabsContent>
        <TabsContent value="plaster"><PlasterCalc /></TabsContent>
        <TabsContent value="tile"><TileCalc /></TabsContent>
      </Tabs>
    </div>
  );
}
