import { useState } from "react";
import { DesignInputForm } from "@/components/design/DesignInputForm";
import { BeamResults, ColumnResults, FootingResults } from "@/components/design/DesignResults";
import { Structural3DViewer } from "@/components/design/Structural3DViewer";
import { ComplianceChecker } from "@/components/design/ComplianceChecker";
import { ExportTools } from "@/components/design/ExportTools";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  calculateBeamDesign,
  calculateColumnDesign,
  calculateFootingDesign,
  estimateBeamCost,
  estimateColumnCost,
  estimateFootingCost,
  type BeamInput,
  type ColumnInput,
  type FootingInput,
  type BeamDesignResult,
  type ColumnDesignResult,
  type FootingDesignResult,
  type CostEstimate,
} from "@/lib/structural-calculations";
import { Ruler, Shield, Box } from "lucide-react";

type DesignType = "beam" | "column" | "footing" | null;
type DesignResult = BeamDesignResult | ColumnDesignResult | FootingDesignResult;
type DesignInput = BeamInput | ColumnInput | FootingInput;

export function DesignView() {
  const [activeTab, setActiveTab] = useState("design");
  const [currentDesign, setCurrentDesign] = useState<{
    type: DesignType;
    input: DesignInput | null;
    result: DesignResult | null;
    cost: CostEstimate | null;
  }>({
    type: null,
    input: null,
    result: null,
    cost: null,
  });

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

  return (
    <div className="min-h-screen pb-24 px-4 pt-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Design Tools</h1>
        <p className="text-muted-foreground text-sm">
          Parametric structural design with auto-calculations
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="design" className="flex items-center gap-2">
            <Ruler className="w-4 h-4" />
            Design
          </TabsTrigger>
          <TabsTrigger value="3d" className="flex items-center gap-2" disabled={!currentDesign.result}>
            <Box className="w-4 h-4" />
            3D View
          </TabsTrigger>
          <TabsTrigger value="compliance" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Compliance
          </TabsTrigger>
        </TabsList>

        {/* Design Tab */}
        <TabsContent value="design" className="space-y-4 mt-0">
          <DesignInputForm
            onBeamSubmit={handleBeamSubmit}
            onColumnSubmit={handleColumnSubmit}
            onFootingSubmit={handleFootingSubmit}
          />

          {/* Results */}
          {currentDesign.type === "beam" && currentDesign.result && currentDesign.cost && (
            <>
              <BeamResults result={currentDesign.result as BeamDesignResult} cost={currentDesign.cost} />
              <ExportTools
                type="beam"
                input={currentDesign.input!}
                result={currentDesign.result}
                cost={currentDesign.cost}
              />
            </>
          )}

          {currentDesign.type === "column" && currentDesign.result && currentDesign.cost && (
            <>
              <ColumnResults result={currentDesign.result as ColumnDesignResult} cost={currentDesign.cost} />
              <ExportTools
                type="column"
                input={currentDesign.input!}
                result={currentDesign.result}
                cost={currentDesign.cost}
              />
            </>
          )}

          {currentDesign.type === "footing" && currentDesign.result && currentDesign.cost && (
            <>
              <FootingResults result={currentDesign.result as FootingDesignResult} cost={currentDesign.cost} />
              <ExportTools
                type="footing"
                input={currentDesign.input!}
                result={currentDesign.result}
                cost={currentDesign.cost}
              />
            </>
          )}
        </TabsContent>

        {/* 3D View Tab */}
        <TabsContent value="3d" className="mt-0">
          {currentDesign.type && currentDesign.input && currentDesign.result && (
            <div className="space-y-4">
              <div className="rounded-xl overflow-hidden border border-border">
                <Structural3DViewer
                  type={currentDesign.type}
                  input={currentDesign.input}
                  result={currentDesign.result}
                />
              </div>
              <div className="text-center text-sm text-muted-foreground">
                Drag to rotate • Scroll to zoom • Shift+drag to pan
              </div>
            </div>
          )}
        </TabsContent>

        {/* Compliance Tab */}
        <TabsContent value="compliance" className="mt-0">
          <ComplianceChecker />
        </TabsContent>
      </Tabs>
    </div>
  );
}
