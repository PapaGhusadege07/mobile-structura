import { Suspense, lazy, useMemo, useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import { HomeView } from "@/components/views/HomeView";
import { ScanView } from "@/components/views/ScanView";
import { ReportsView } from "@/components/views/ReportsView";
import { SettingsView } from "@/components/views/SettingsView";
import { DesignView } from "@/components/views/DesignView";
import { DrainageView } from "@/components/views/DrainageView";
import { ViewSkeleton } from "@/components/ui/view-skeleton";

const PricingView = lazy(() => import("@/components/views/PricingView").then((module) => ({ default: module.PricingView })));
const AnalyticsView = lazy(() => import("@/components/views/AnalyticsView").then((module) => ({ default: module.AnalyticsView })));
const CalculatorsView = lazy(() => import("@/components/views/CalculatorsView").then((module) => ({ default: module.CalculatorsView })));
const CostEstimatorView = lazy(() => import("@/components/views/CostEstimatorView").then((module) => ({ default: module.CostEstimatorView })));
const SupplierView = lazy(() => import("@/components/views/SupplierView").then((module) => ({ default: module.SupplierView })));
const SchedulingView = lazy(() => import("@/components/views/SchedulingView").then((module) => ({ default: module.SchedulingView })));
const MarketPriceView = lazy(() => import("@/components/views/MarketPriceView").then((module) => ({ default: module.MarketPriceView })));

const Index = () => {
  const [activeTab, setActiveTab] = useState("home");

  const handleStartScan = () => setActiveTab("scan");
  const handleScanComplete = () => setActiveTab("reports");

  const content = useMemo(() => {
    switch (activeTab) {
      case "home": return <HomeView onStartScan={handleStartScan} />;
      case "scan": return <ScanView onComplete={handleScanComplete} onBack={() => setActiveTab("home")} />;
      case "reports": return <ReportsView />;
      case "design": return <DesignView />;
      case "drainage": return <DrainageView />;
      case "settings": return <SettingsView />;
      case "pricing": return <PricingView />;
      case "market": return <MarketPriceView />;
      case "analytics": return <AnalyticsView />;
      case "calculators": return <CalculatorsView />;
      case "estimator": return <CostEstimatorView />;
      case "suppliers": return <SupplierView />;
      case "schedule": return <SchedulingView />;
      default: return <HomeView onStartScan={handleStartScan} />;
    }
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<ViewSkeleton />}>
        {content}
      </Suspense>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
