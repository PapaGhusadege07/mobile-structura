import { useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import { HomeView } from "@/components/views/HomeView";
import { ScanView } from "@/components/views/ScanView";
import { ReportsView } from "@/components/views/ReportsView";
import { SettingsView } from "@/components/views/SettingsView";
import { DesignView } from "@/components/views/DesignView";
import { DrainageView } from "@/components/views/DrainageView";
import { MarketPriceView } from "@/components/views/MarketPriceView";
import { AnalyticsView } from "@/components/views/AnalyticsView";
import { CalculatorsView } from "@/components/views/CalculatorsView";
import { CostEstimatorView } from "@/components/views/CostEstimatorView";
import { SupplierView } from "@/components/views/SupplierView";
import { RegionPricingView } from "@/components/views/RegionPricingView";
import { AdminPricingView } from "@/components/views/AdminPricingView";

const Index = () => {
  const [activeTab, setActiveTab] = useState("home");

  const handleStartScan = () => setActiveTab("scan");
  const handleScanComplete = () => setActiveTab("reports");

  const renderView = () => {
    switch (activeTab) {
      case "home": return <HomeView onStartScan={handleStartScan} />;
      case "scan": return <ScanView onComplete={handleScanComplete} onBack={() => setActiveTab("home")} />;
      case "reports": return <ReportsView />;
      case "design": return <DesignView />;
      case "drainage": return <DrainageView />;
      case "settings": return <SettingsView />;
      case "market": return <MarketPriceView />;
      case "analytics": return <AnalyticsView />;
      case "calculators": return <CalculatorsView />;
      case "estimator": return <CostEstimatorView />;
      case "suppliers": return <SupplierView />;
      case "pricing": return <RegionPricingView />;
      case "admin-pricing": return <AdminPricingView />;
      default: return <HomeView onStartScan={handleStartScan} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {renderView()}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
