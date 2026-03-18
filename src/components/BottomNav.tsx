import { useState } from "react";
import { Home, Scan, BarChart3, Settings, Ruler, Droplets, TrendingUp, LineChart, Calculator, IndianRupee, Store, Menu, X, CalendarDays, WalletCards } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  id: string;
}

const navItems: NavItem[] = [
  { icon: Home, label: "Home", id: "home" },
  { icon: WalletCards, label: "Pricing", id: "pricing" },
  { icon: LineChart, label: "Analytics", id: "analytics" },
  { icon: Calculator, label: "Calc", id: "calculators" },
  { icon: IndianRupee, label: "Estimate", id: "estimator" },
];

const moreItems: NavItem[] = [
  { icon: TrendingUp, label: "Prices", id: "market" },
  { icon: Store, label: "Suppliers", id: "suppliers" },
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
      {showMore && (
        <div className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm animate-fade-in motion-reduce:animate-none" onClick={() => setShowMore(false)}>
          <div className="absolute bottom-16 left-2 right-2 rounded-xl border border-border/50 p-3 glass shadow-card animate-sheet-up motion-reduce:animate-none" onClick={(event) => event.stopPropagation()}>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
              {moreItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onTabChange(item.id);
                      setShowMore(false);
                    }}
                    className={cn(
                      "nav-press flex flex-col items-center gap-1 rounded-xl px-1 py-2 transition-all duration-200",
                      isActive ? "bg-accent/10 text-accent" : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-[9px] font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/50 glass">
        <div className="mx-auto flex max-w-lg items-center justify-around px-1 py-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={cn(
                  "nav-press flex flex-col items-center gap-0.5 rounded-xl px-1.5 py-2 transition-all duration-200",
                  isActive ? "text-accent" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <div className={cn("rounded-xl p-1 transition-all duration-200", isActive && "bg-accent/10 shadow-glow")}>
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-[8px] font-medium leading-none">{item.label}</span>
              </button>
            );
          })}
          <button
            onClick={() => setShowMore((value) => !value)}
            className={cn(
              "nav-press flex flex-col items-center gap-0.5 rounded-xl px-1.5 py-2 transition-all duration-200",
              showMore ? "text-accent" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <div className={cn("rounded-xl p-1 transition-all duration-200", showMore && "bg-accent/10 shadow-glow")}>
              {showMore ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </div>
            <span className="text-[8px] font-medium leading-none">More</span>
          </button>
        </div>
      </nav>
    </>
  );
}
