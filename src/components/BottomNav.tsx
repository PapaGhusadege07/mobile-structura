import { useState } from "react";
import { Home, Scan, BarChart3, Settings, Ruler, Droplets, TrendingUp, LineChart, Calculator, IndianRupee, Store, Menu, X, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  id: string;
  group?: "main" | "market";
}

const navItems: NavItem[] = [
  { icon: Home, label: "Home", id: "home", group: "main" },
  { icon: TrendingUp, label: "Prices", id: "market", group: "market" },
  { icon: LineChart, label: "Analytics", id: "analytics", group: "market" },
  { icon: Calculator, label: "Calc", id: "calculators", group: "market" },
  { icon: IndianRupee, label: "Estimate", id: "estimator", group: "market" },
  { icon: Store, label: "Suppliers", id: "suppliers", group: "market" },
];

const moreItems: NavItem[] = [
  { icon: CalendarDays, label: "Schedule", id: "schedule" },
  { icon: Scan, label: "Scan", id: "scan" },
  { icon: BarChart3, label: "Reports", id: "reports" },
  { icon: Ruler, label: "Structure", id: "design" },
  { icon: Droplets, label: "Drainage", id: "drainage" },
  { icon: Settings, label: "Settings", id: "settings" },
];

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const [showMore, setShowMore] = useState(false);

  return (
    <>
      {/* More Menu Overlay */}
      {showMore && (
        <div className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm" onClick={() => setShowMore(false)}>
          <div className="absolute bottom-16 left-2 right-2 p-3 rounded-xl glass border border-border/50 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="grid grid-cols-5 gap-1">
              {moreItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => { onTabChange(item.id); setShowMore(false); }}
                    className={cn(
                      "flex flex-col items-center gap-1 py-2 px-1 rounded-xl transition-all",
                      isActive ? "text-accent bg-accent/10" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-[9px] font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-border/50">
        <div className="flex items-center justify-around py-1 px-1 max-w-lg mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={cn(
                  "flex flex-col items-center gap-0.5 py-2 px-1.5 rounded-xl transition-all duration-200",
                  isActive ? "text-accent" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <div className={cn("p-1 rounded-xl transition-all duration-200", isActive && "bg-accent/10")}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[8px] font-medium leading-none">{item.label}</span>
              </button>
            );
          })}
          <button
            onClick={() => setShowMore(!showMore)}
            className={cn(
              "flex flex-col items-center gap-0.5 py-2 px-1.5 rounded-xl transition-all duration-200",
              showMore ? "text-accent" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <div className={cn("p-1 rounded-xl transition-all duration-200", showMore && "bg-accent/10")}>
              {showMore ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </div>
            <span className="text-[8px] font-medium leading-none">More</span>
          </button>
        </div>
      </nav>
    </>
  );
}
