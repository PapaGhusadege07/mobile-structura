import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  type BeamInput, type ColumnInput, type FootingInput, type SlabInput,
  type BeamDesignResult, type ColumnDesignResult, type FootingDesignResult, type SlabDesignResult,
} from "@/lib/structural-calculations";
import { LayoutList } from "lucide-react";

interface BarScheduleProps {
  type: "beam" | "column" | "footing" | "slab";
  input: BeamInput | ColumnInput | FootingInput | SlabInput;
  result: BeamDesignResult | ColumnDesignResult | FootingDesignResult | SlabDesignResult;
}

interface BarItem {
  id: string;
  description: string;
  barType: string;
  diameter: number;
  count: number;
  length: number; // mm
  totalLength: number; // m
  weight: number; // kg
}

function parseBarInfo(barStr: string): { count: number; diameter: number } {
  const countMatch = barStr.match(/^(\d+)/);
  const diaMatch = barStr.match(/(\d+)mm/);
  return {
    count: countMatch ? parseInt(countMatch[1]) : 2,
    diameter: diaMatch ? parseInt(diaMatch[1]) : 12,
  };
}

function getBeamSchedule(input: BeamInput, result: BeamDesignResult): BarItem[] {
  const tension = parseBarInfo(result.reinforcement.tensionBars);
  const comp = parseBarInfo(result.reinforcement.compressionBars);
  const stirrupSpacing = parseInt(result.reinforcement.stirrups.match(/@\s*(\d+)/)?.[1] || "200");
  const spanMm = input.spanLength * 1000;
  const numStirrups = Math.ceil(spanMm / stirrupSpacing) + 1;
  const stirrupPerimeter = 2 * ((input.width - 50) + (input.depth - 50)) + 20 * 8 * 2; // hooks

  // Curtailed bars: half the tension bars at 60% length
  const fullCount = Math.ceil(tension.count / 2);
  const curtailedCount = tension.count - fullCount;
  const curtailedLength = Math.round(spanMm * 0.6 + 12 * tension.diameter); // + development length

  const items: BarItem[] = [];

  items.push({
    id: "A", description: "Bottom Main (Full)", barType: "Main",
    diameter: tension.diameter, count: fullCount,
    length: spanMm + 2 * 40 * tension.diameter, // anchorage
    totalLength: +((fullCount * (spanMm + 2 * 40 * tension.diameter)) / 1000).toFixed(2),
    weight: +(fullCount * Math.PI * Math.pow(tension.diameter, 2) / 4 * (spanMm + 2 * 40 * tension.diameter) * 7850 / 1e9).toFixed(2),
  });

  if (curtailedCount > 0) {
    items.push({
      id: "B", description: "Bottom Main (Curtailed)", barType: "Curtailed",
      diameter: tension.diameter, count: curtailedCount,
      length: curtailedLength,
      totalLength: +((curtailedCount * curtailedLength) / 1000).toFixed(2),
      weight: +(curtailedCount * Math.PI * Math.pow(tension.diameter, 2) / 4 * curtailedLength * 7850 / 1e9).toFixed(2),
    });
  }

  items.push({
    id: "C", description: "Top Bars (Compression)", barType: "Main",
    diameter: comp.diameter, count: comp.count,
    length: spanMm + 2 * 40 * comp.diameter,
    totalLength: +((comp.count * (spanMm + 2 * 40 * comp.diameter)) / 1000).toFixed(2),
    weight: +(comp.count * Math.PI * Math.pow(comp.diameter, 2) / 4 * (spanMm + 2 * 40 * comp.diameter) * 7850 / 1e9).toFixed(2),
  });

  items.push({
    id: "D", description: "Stirrups (2L)", barType: "Stirrup",
    diameter: 8, count: numStirrups,
    length: stirrupPerimeter,
    totalLength: +((numStirrups * stirrupPerimeter) / 1000).toFixed(2),
    weight: +(numStirrups * Math.PI * Math.pow(8, 2) / 4 * stirrupPerimeter * 7850 / 1e9).toFixed(2),
  });

  return items;
}

function getColumnSchedule(input: ColumnInput, result: ColumnDesignResult): BarItem[] {
  const bars = parseBarInfo(result.reinforcement.mainBars);
  const tieSpacing = parseInt(result.reinforcement.ties.match(/@\s*(\d+)/)?.[1] || "300");
  const heightMm = input.height * 1000;
  const numTies = Math.ceil(heightMm / tieSpacing) + 1;
  const tiePerimeter = 2 * ((input.width - 50) + (input.depth - 50)) + 20 * 8 * 2;

  return [
    {
      id: "A", description: "Main Vertical Bars", barType: "Main",
      diameter: bars.diameter, count: bars.count,
      length: heightMm + 40 * bars.diameter + 300, // lap
      totalLength: +((bars.count * (heightMm + 40 * bars.diameter + 300)) / 1000).toFixed(2),
      weight: +(bars.count * Math.PI * Math.pow(bars.diameter, 2) / 4 * (heightMm + 40 * bars.diameter + 300) * 7850 / 1e9).toFixed(2),
    },
    {
      id: "B", description: "Lateral Ties", barType: "Tie",
      diameter: 8, count: numTies,
      length: tiePerimeter,
      totalLength: +((numTies * tiePerimeter) / 1000).toFixed(2),
      weight: +(numTies * Math.PI * Math.pow(8, 2) / 4 * tiePerimeter * 7850 / 1e9).toFixed(2),
    },
  ];
}

function getFootingSchedule(input: FootingInput, result: FootingDesignResult): BarItem[] {
  const barsX = parseBarInfo(result.reinforcement.mainBarsX);
  const spacing = parseInt(result.reinforcement.mainBarsX.match(/@\s*(\d+)/)?.[1] || "150");
  const numBarsX = Math.ceil(result.dimensions.length / spacing) + 1;
  const numBarsY = Math.ceil(result.dimensions.width / spacing) + 1;
  const barLenX = result.dimensions.width - 2 * 50 + 2 * 40 * barsX.diameter;
  const barLenY = result.dimensions.length - 2 * 50 + 2 * 40 * barsX.diameter;

  return [
    {
      id: "A", description: "Bottom Bars (X-dir)", barType: "Main",
      diameter: barsX.diameter, count: numBarsX,
      length: barLenX,
      totalLength: +((numBarsX * barLenX) / 1000).toFixed(2),
      weight: +(numBarsX * Math.PI * Math.pow(barsX.diameter, 2) / 4 * barLenX * 7850 / 1e9).toFixed(2),
    },
    {
      id: "B", description: "Bottom Bars (Y-dir)", barType: "Main",
      diameter: barsX.diameter, count: numBarsY,
      length: barLenY,
      totalLength: +((numBarsY * barLenY) / 1000).toFixed(2),
      weight: +(numBarsY * Math.PI * Math.pow(barsX.diameter, 2) / 4 * barLenY * 7850 / 1e9).toFixed(2),
    },
  ];
}

function getSlabSchedule(input: SlabInput, result: SlabDesignResult): BarItem[] {
  const shortBars = parseBarInfo(result.reinforcement.shortSpanBars);
  const longBars = parseBarInfo(result.reinforcement.longSpanBars);
  const lx = Math.min(input.spanLx, input.spanLy) * 1000;
  const ly = Math.max(input.spanLx, input.spanLy) * 1000;
  const shortSpacing = parseInt(result.reinforcement.shortSpanBars.match(/@\s*(\d+)/)?.[1] || "150");
  const longSpacing = parseInt(result.reinforcement.longSpanBars.match(/@\s*(\d+)/)?.[1] || "200");
  const numShort = Math.ceil(ly / shortSpacing) + 1;
  const numLong = Math.ceil(lx / longSpacing) + 1;
  const shortLen = lx - 2 * 25 + 2 * 40 * shortBars.diameter;
  const longLen = ly - 2 * 25 + 2 * 40 * longBars.diameter;

  return [
    {
      id: "A", description: "Short Span Bars (Lx)", barType: "Main",
      diameter: shortBars.diameter, count: numShort,
      length: shortLen,
      totalLength: +((numShort * shortLen) / 1000).toFixed(2),
      weight: +(numShort * Math.PI * Math.pow(shortBars.diameter, 2) / 4 * shortLen * 7850 / 1e9).toFixed(2),
    },
    {
      id: "B", description: result.slabType === "one-way" ? "Distribution Bars" : "Long Span Bars (Ly)", barType: result.slabType === "one-way" ? "Distribution" : "Main",
      diameter: longBars.diameter, count: numLong,
      length: longLen,
      totalLength: +((numLong * longLen) / 1000).toFixed(2),
      weight: +(numLong * Math.PI * Math.pow(longBars.diameter, 2) / 4 * longLen * 7850 / 1e9).toFixed(2),
    },
  ];
}

export function BarSchedule({ type, input, result }: BarScheduleProps) {
  let schedule: BarItem[] = [];
  if (type === "beam") schedule = getBeamSchedule(input as BeamInput, result as BeamDesignResult);
  else if (type === "column") schedule = getColumnSchedule(input as ColumnInput, result as ColumnDesignResult);
  else if (type === "footing") schedule = getFootingSchedule(input as FootingInput, result as FootingDesignResult);
  else if (type === "slab") schedule = getSlabSchedule(input as SlabInput, result as SlabDesignResult);

  const totalWeight = schedule.reduce((sum, b) => sum + b.weight, 0);

  return (
    <Card variant="elevated">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <LayoutList className="w-4 h-4 text-accent" />Bar Bending Schedule (BBS)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Bar</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Ø (mm)</TableHead>
                <TableHead className="text-right">Nos</TableHead>
                <TableHead className="text-right">Length (mm)</TableHead>
                <TableHead className="text-right">Total (m)</TableHead>
                <TableHead className="text-right">Wt (kg)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schedule.map((bar) => (
                <TableRow key={bar.id}>
                  <TableCell className="font-mono font-bold text-accent">{bar.id}</TableCell>
                  <TableCell className="text-sm">{bar.description}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{bar.barType}</TableCell>
                  <TableCell className="text-right font-mono">{bar.diameter}</TableCell>
                  <TableCell className="text-right font-mono">{bar.count}</TableCell>
                  <TableCell className="text-right font-mono">{Math.round(bar.length)}</TableCell>
                  <TableCell className="text-right font-mono">{bar.totalLength}</TableCell>
                  <TableCell className="text-right font-mono font-semibold">{bar.weight}</TableCell>
                </TableRow>
              ))}
              <TableRow className="border-t-2 border-foreground/20">
                <TableCell colSpan={7} className="font-semibold text-right">Total Steel Weight</TableCell>
                <TableCell className="text-right font-mono font-bold text-accent">{totalWeight.toFixed(2)} kg</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
