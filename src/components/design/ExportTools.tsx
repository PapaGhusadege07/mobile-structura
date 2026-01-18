import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  type BeamInput, 
  type ColumnInput, 
  type FootingInput,
  type BeamDesignResult,
  type ColumnDesignResult,
  type FootingDesignResult,
  type CostEstimate
} from "@/lib/structural-calculations";
import { jsPDF } from "jspdf";
import { Download, FileText, FileCode, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ExportToolsProps {
  type: "beam" | "column" | "footing";
  input: BeamInput | ColumnInput | FootingInput;
  result: BeamDesignResult | ColumnDesignResult | FootingDesignResult;
  cost: CostEstimate;
}

export function ExportTools({ type, input, result, cost }: ExportToolsProps) {
  const [isExporting, setIsExporting] = useState(false);

  const generatePDF = async () => {
    setIsExporting(true);
    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      let y = 20;
      const lineHeight = 7;
      const margin = 20;

      // Title
      pdf.setFontSize(20);
      pdf.setFont("helvetica", "bold");
      pdf.text("StructuraScan", margin, y);
      y += 10;
      
      pdf.setFontSize(16);
      pdf.text(`${type.charAt(0).toUpperCase() + type.slice(1)} Design Report`, margin, y);
      y += 15;

      // Date
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.text(`Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, margin, y);
      y += 15;

      // Input Parameters Section
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text("Input Parameters", margin, y);
      y += 10;

      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");

      if (type === "beam") {
        const beamInput = input as BeamInput;
        const params = [
          `Span Length: ${beamInput.spanLength} m`,
          `Width: ${beamInput.width} mm`,
          `Depth: ${beamInput.depth} mm`,
          `Dead Load: ${beamInput.deadLoad} kN/m`,
          `Live Load: ${beamInput.liveLoad} kN/m`,
          `Concrete Grade: ${beamInput.concreteGrade}`,
          `Steel Grade: ${beamInput.steelGrade}`,
        ];
        params.forEach((param) => {
          pdf.text(param, margin, y);
          y += lineHeight;
        });
      } else if (type === "column") {
        const columnInput = input as ColumnInput;
        const params = [
          `Height: ${columnInput.height} m`,
          `Width: ${columnInput.width} mm`,
          `Depth: ${columnInput.depth} mm`,
          `Axial Load: ${columnInput.axialLoad} kN`,
          `Moment X: ${columnInput.momentX} kNm`,
          `Moment Y: ${columnInput.momentY} kNm`,
          `Concrete Grade: ${columnInput.concreteGrade}`,
          `Steel Grade: ${columnInput.steelGrade}`,
        ];
        params.forEach((param) => {
          pdf.text(param, margin, y);
          y += lineHeight;
        });
      } else {
        const footingInput = input as FootingInput;
        const params = [
          `Column Width: ${footingInput.columnWidth} mm`,
          `Column Depth: ${footingInput.columnDepth} mm`,
          `Axial Load: ${footingInput.axialLoad} kN`,
          `Soil Bearing Capacity: ${footingInput.soilBearingCapacity} kN/m²`,
          `Concrete Grade: ${footingInput.concreteGrade}`,
          `Steel Grade: ${footingInput.steelGrade}`,
        ];
        params.forEach((param) => {
          pdf.text(param, margin, y);
          y += lineHeight;
        });
      }

      y += 10;

      // Design Results Section
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text("Design Results", margin, y);
      y += 10;

      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");

      if (type === "beam") {
        const beamResult = result as BeamDesignResult;
        const results = [
          `Status: ${beamResult.status.toUpperCase()}`,
          "",
          "Reinforcement:",
          `  Tension Bars: ${beamResult.reinforcement.tensionBars}`,
          `  Tension Area: ${beamResult.reinforcement.tensionArea} mm²`,
          `  Compression Bars: ${beamResult.reinforcement.compressionBars}`,
          `  Stirrups: ${beamResult.reinforcement.stirrups}`,
          "",
          "Design Checks:",
          `  Ultimate Moment: ${beamResult.moments.ultimate} kNm`,
          `  Moment Capacity: ${beamResult.moments.resistance} kNm`,
          `  Deflection: ${beamResult.deflection.calculated} mm (Allowable: ${beamResult.deflection.allowable} mm)`,
        ];
        results.forEach((line) => {
          pdf.text(line, margin, y);
          y += lineHeight;
        });
      } else if (type === "column") {
        const columnResult = result as ColumnDesignResult;
        const results = [
          `Status: ${columnResult.status.toUpperCase()}`,
          "",
          "Reinforcement:",
          `  Main Bars: ${columnResult.reinforcement.mainBars}`,
          `  Steel Area: ${columnResult.reinforcement.mainArea} mm²`,
          `  Steel Percentage: ${columnResult.reinforcement.percentage}%`,
          `  Ties: ${columnResult.reinforcement.ties}`,
          "",
          "Capacity:",
          `  Axial Capacity: ${columnResult.capacity.axial} kN`,
          `  Moment Capacity X: ${columnResult.capacity.momentX} kNm`,
          `  Moment Capacity Y: ${columnResult.capacity.momentY} kNm`,
          "",
          `Slenderness Ratio: ${columnResult.slenderness.ratio} (${columnResult.slenderness.classification})`,
        ];
        results.forEach((line) => {
          pdf.text(line, margin, y);
          y += lineHeight;
        });
      } else {
        const footingResult = result as FootingDesignResult;
        const results = [
          `Status: ${footingResult.status.toUpperCase()}`,
          "",
          "Dimensions:",
          `  Length: ${footingResult.dimensions.length} mm`,
          `  Width: ${footingResult.dimensions.width} mm`,
          `  Depth: ${footingResult.dimensions.depth} mm`,
          "",
          "Reinforcement:",
          `  X-Direction: ${footingResult.reinforcement.mainBarsX}`,
          `  Y-Direction: ${footingResult.reinforcement.mainBarsY}`,
          "",
          "Soil Pressure:",
          `  Actual: ${footingResult.pressure.actual} kN/m²`,
          `  Allowable: ${footingResult.pressure.allowable} kN/m²`,
        ];
        results.forEach((line) => {
          pdf.text(line, margin, y);
          y += lineHeight;
        });
      }

      y += 10;

      // Cost Estimate Section
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text("Cost Estimate", margin, y);
      y += 10;

      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");

      Object.entries(cost.materials).forEach(([material, data]) => {
        pdf.text(`${material.charAt(0).toUpperCase() + material.slice(1)}: ${data.quantity} ${data.unit} × ₹${data.rate} = ₹${data.cost.toLocaleString()}`, margin, y);
        y += lineHeight;
      });
      
      pdf.text(`Labor (35%): ₹${cost.labor.toLocaleString()}`, margin, y);
      y += lineHeight;
      
      pdf.setFont("helvetica", "bold");
      pdf.text(`Total: ₹${cost.total.toLocaleString()}`, margin, y);

      // Footer
      pdf.setFontSize(8);
      pdf.setFont("helvetica", "italic");
      pdf.text("Generated by StructuraScan - AI-Powered Structural Design", margin, pdf.internal.pageSize.getHeight() - 10);

      // Save
      pdf.save(`structurascan-${type}-design-${Date.now()}.pdf`);
      toast.success("PDF exported successfully!");
    } catch {
      toast.error("Failed to export PDF");
    } finally {
      setIsExporting(false);
    }
  };

  const generateDXF = () => {
    // Generate a simple DXF file for AutoCAD
    let dxf = "0\nSECTION\n2\nENTITIES\n";

    if (type === "beam") {
      const beamInput = input as BeamInput;
      const length = beamInput.spanLength * 1000;
      const width = beamInput.width;
      const depth = beamInput.depth;

      // Draw beam outline
      dxf += `0\nLINE\n8\nBEAM\n10\n0\n20\n0\n11\n${length}\n21\n0\n`;
      dxf += `0\nLINE\n8\nBEAM\n10\n${length}\n20\n0\n11\n${length}\n21\n${depth}\n`;
      dxf += `0\nLINE\n8\nBEAM\n10\n${length}\n20\n${depth}\n11\n0\n21\n${depth}\n`;
      dxf += `0\nLINE\n8\nBEAM\n10\n0\n20\n${depth}\n11\n0\n21\n0\n`;

      // Add dimension text
      dxf += `0\nTEXT\n8\nDIMENSIONS\n10\n${length / 2}\n20\n-50\n40\n30\n1\nSpan: ${beamInput.spanLength}m\n`;
      dxf += `0\nTEXT\n8\nDIMENSIONS\n10\n${length + 50}\n20\n${depth / 2}\n40\n30\n1\n${depth}mm\n`;
    } else if (type === "column") {
      const columnInput = input as ColumnInput;
      const width = columnInput.width;
      const depth = columnInput.depth;

      // Draw column section
      dxf += `0\nLINE\n8\nCOLUMN\n10\n0\n20\n0\n11\n${width}\n21\n0\n`;
      dxf += `0\nLINE\n8\nCOLUMN\n10\n${width}\n20\n0\n11\n${width}\n21\n${depth}\n`;
      dxf += `0\nLINE\n8\nCOLUMN\n10\n${width}\n20\n${depth}\n11\n0\n21\n${depth}\n`;
      dxf += `0\nLINE\n8\nCOLUMN\n10\n0\n20\n${depth}\n11\n0\n21\n0\n`;
    } else {
      const footingResult = result as FootingDesignResult;
      const length = footingResult.dimensions.length;
      const width = footingResult.dimensions.width;

      // Draw footing plan
      dxf += `0\nLINE\n8\nFOOTING\n10\n0\n20\n0\n11\n${length}\n21\n0\n`;
      dxf += `0\nLINE\n8\nFOOTING\n10\n${length}\n20\n0\n11\n${length}\n21\n${width}\n`;
      dxf += `0\nLINE\n8\nFOOTING\n10\n${length}\n20\n${width}\n11\n0\n21\n${width}\n`;
      dxf += `0\nLINE\n8\nFOOTING\n10\n0\n20\n${width}\n11\n0\n21\n0\n`;
    }

    dxf += "0\nENDSEC\n0\nEOF\n";

    // Download
    const blob = new Blob([dxf], { type: "application/dxf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `structurascan-${type}-${Date.now()}.dxf`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("DXF file exported for AutoCAD!");
  };

  return (
    <Card variant="default">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Download className="w-4 h-4 text-accent" />
          Export Options
        </CardTitle>
      </CardHeader>
      <CardContent className="flex gap-3">
        <Button
          variant="outline"
          className="flex-1"
          onClick={generatePDF}
          disabled={isExporting}
        >
          {isExporting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <FileText className="w-4 h-4" />
          )}
          Export PDF
        </Button>
        <Button
          variant="outline"
          className="flex-1"
          onClick={generateDXF}
        >
          <FileCode className="w-4 h-4" />
          Export DXF
        </Button>
      </CardContent>
    </Card>
  );
}
