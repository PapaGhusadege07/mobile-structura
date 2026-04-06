import { useState } from "react";
import { DesignInputForm } from "@/components/design/DesignInputForm";
import { BeamResults, ColumnResults, FootingResults, SlabResults } from "@/components/design/DesignResults";
import { Structural3DViewer } from "@/components/design/Structural3DViewer";
import { ComplianceChecker } from "@/components/design/ComplianceChecker";
import { ExportTools } from "@/components/design/ExportTools";
import { Drawing2D } from "@/components/design/Drawing2D";
import { BarSchedule } from "@/components/design/BarSchedule";
import { SteelCostPanel } from "@/components/design/SteelCostPanel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  calculateBeamDesign,
  calculateColumnDesign,
  calculateFootingDesign,
  calculateSlabDesign,
  estimateBeamCost,
  estimateColumnCost,
  estimateFootingCost,
  estimateSlabCost,
  type BeamInput,
  type ColumnInput,
  type FootingInput,
  type SlabInput,
  type BeamDesignResult,
  type ColumnDesignResult,
  type FootingDesignResult,
  type SlabDesignResult,
  type CostEstimate,
} from "@/lib/structural-calculations";
import { Ruler, Shield, Box, PenTool, LayoutList, IndianRupee } from "lucide-react";

type DesignType = "beam" | "column" | "footing" | "slab" | null;
type DesignResult = BeamDesignResult | ColumnDesignResult | FootingDesignResult | SlabDesignResult;
type DesignInput = BeamInput | ColumnInput | FootingInput | SlabInput;

export function DesignView() {
  const [activeTab, setActiveTab] = useState("design");
  const [currentDesign, setCurrentDesign] = useState<{
    type: DesignType;
    input: DesignInput | null;
    result: DesignResult | null;
    cost: CostEstimate | null;
  }>({ type: null, input: null, result: null, cost: null });

  const handleBeamSubmit = (data: BeamInput) => {
    const result = calculateBeamDesign(data);
    const cost = estimateBeamCost(data, result);
    setCurrentDesign({ type: "beam", input: data, result, cost });
  };

  const handleColumnSubmit = (data: ColumnInput) => {
    const result = calculateColumnDesign(data);
    const cost = estimateColumnCost(data, result);
    setCurrentDesign({ type: "column", input: data, result, cost });
  };

  const handleFootingSubmit = (data: FootingInput) => {
    const result = calculateFootingDesign(data);
    const cost = estimateFootingCost(data, result);
    setCurrentDesign({ type: "footing", input: data, result, cost });
  };

  const handleSlabSubmit = (data: SlabInput) => {
    const result = calculateSlabDesign(data);
    const cost = estimateSlabCost(data, result);
    setCurrentDesign({ type: "slab", input: data, result, cost });
  };

  const hasResult = currentDesign.result !== null;

  return (
    <div className="min-h-screen pb-24 px-4 pt-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">IS Code Design</h1>
        <p className="text-muted-foreground text-sm">
          IS 456:2000 compliant structural design with step-by-step calculations
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-6">
          <TabsTrigger value="design" className="flex items-center gap-1 text-xs">
            <Ruler className="w-3.5 h-3.5" />Design
          </TabsTrigger>
          <TabsTrigger value="2d" className="flex items-center gap-1 text-xs" disabled={!hasResult}>
            <PenTool className="w-3.5 h-3.5" />2D
          </TabsTrigger>
          <TabsTrigger value="3d" className="flex items-center gap-1 text-xs" disabled={!hasResult}>
            <Box className="w-3.5 h-3.5" />3D
          </TabsTrigger>
          <TabsTrigger value="bbs" className="flex items-center gap-1 text-xs" disabled={!hasResult}>
            <LayoutList className="w-3.5 h-3.5" />BBS
          </TabsTrigger>
          <TabsTrigger value="cost" className="flex items-center gap-1 text-xs" disabled={!hasResult}>
            <IndianRupee className="w-3.5 h-3.5" />Cost
          </TabsTrigger>
          <TabsTrigger value="compliance" className="flex items-center gap-1 text-xs">
            <Shield className="w-3.5 h-3.5" />Code
          </TabsTrigger>
        </TabsList>

        <TabsContent value="design" className="space-y-4 mt-0">
          <DesignInputForm
            onBeamSubmit={handleBeamSubmit}
            onColumnSubmit={handleColumnSubmit}
            onFootingSubmit={handleFootingSubmit}
            onSlabSubmit={handleSlabSubmit}
          />

          {currentDesign.type === "beam" && currentDesign.result && currentDesign.cost && (
            <>
              <BeamResults result={currentDesign.result as BeamDesignResult} cost={currentDesign.cost} />
              <ExportTools type="beam" input={currentDesign.input!} result={currentDesign.result} cost={currentDesign.cost} />
            </>
          )}

          {currentDesign.type === "column" && currentDesign.result && currentDesign.cost && (
            <>
              <ColumnResults result={currentDesign.result as ColumnDesignResult} cost={currentDesign.cost} />
              <ExportTools type="column" input={currentDesign.input!} result={currentDesign.result} cost={currentDesign.cost} />
            </>
          )}

          {currentDesign.type === "footing" && currentDesign.result && currentDesign.cost && (
            <>
              <FootingResults result={currentDesign.result as FootingDesignResult} cost={currentDesign.cost} />
              <ExportTools type="footing" input={currentDesign.input!} result={currentDesign.result} cost={currentDesign.cost} />
            </>
          )}

          {currentDesign.type === "slab" && currentDesign.result && currentDesign.cost && (
            <>
              <SlabResults result={currentDesign.result as SlabDesignResult} cost={currentDesign.cost} />
              <ExportTools type="slab" input={currentDesign.input!} result={currentDesign.result} cost={currentDesign.cost} />
            </>
          )}
        </TabsContent>

        <TabsContent value="2d" className="mt-0">
          {currentDesign.type && currentDesign.input && currentDesign.result && (
            <Drawing2D type={currentDesign.type} input={currentDesign.input} result={currentDesign.result} />
          )}
        </TabsContent>

        <TabsContent value="3d" className="mt-0">
          {currentDesign.type && currentDesign.input && currentDesign.result && (
            <Structural3DViewer type={currentDesign.type} input={currentDesign.input} result={currentDesign.result} />
          )}
        </TabsContent>

        <TabsContent value="bbs" className="mt-0">
          {currentDesign.type && currentDesign.input && currentDesign.result && (
            <BarSchedule type={currentDesign.type} input={currentDesign.input} result={currentDesign.result} />
          )}
        </TabsContent>

        <TabsContent value="cost" className="mt-0">
          {currentDesign.type && currentDesign.input && currentDesign.result && currentDesign.cost && (
            <SteelCostPanel type={currentDesign.type} input={currentDesign.input} result={currentDesign.result} cost={currentDesign.cost} />
          )}
        </TabsContent>

        <TabsContent value="compliance" className="mt-0">
          <ComplianceChecker />
        </TabsContent>
      </Tabs>
    </div>
  );
}
