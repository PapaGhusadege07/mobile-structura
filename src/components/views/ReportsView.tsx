import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HealthScore } from "@/components/HealthScore";
import { StatusBadge } from "@/components/StatusBadge";
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Building2,
  Calendar,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

const analyticsData = {
  totalScans: 47,
  averageScore: 84,
  structuresMonitored: 12,
  alerts: 2,
};

const trendData = [
  { month: "Oct", value: 78 },
  { month: "Nov", value: 82 },
  { month: "Dec", value: 79 },
  { month: "Jan", value: 84 },
];

const alertsList = [
  {
    id: "1",
    structure: "Riverside Bridge",
    issue: "Elevated vibration detected",
    severity: "warning" as const,
    date: "2 days ago",
  },
  {
    id: "2",
    structure: "Parking Garage B",
    issue: "Minor tilt deviation",
    severity: "warning" as const,
    date: "1 week ago",
  },
];

export function ReportsView() {
  return (
    <div className="min-h-screen pb-24 px-6 pt-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Reports & Analytics</h1>
        <p className="text-muted-foreground text-sm">
          Monitor trends and structural health over time
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {[
          { label: "Total Scans", value: analyticsData.totalScans, icon: Activity, color: "text-accent" },
          { label: "Avg Score", value: analyticsData.averageScore, icon: TrendingUp, color: "text-success" },
          { label: "Structures", value: analyticsData.structuresMonitored, icon: Building2, color: "text-primary" },
          { label: "Active Alerts", value: analyticsData.alerts, icon: TrendingDown, color: "text-warning" },
        ].map((stat, index) => (
          <Card
            key={stat.label}
            variant="default"
            className="animate-fade-in"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <CardContent className="p-4">
              <stat.icon className={cn("w-5 h-5 mb-2", stat.color)} />
              <div className="text-2xl font-bold font-mono">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Health Trend */}
      <Card variant="elevated" className="mb-6 animate-fade-in" style={{ animationDelay: "0.2s" }}>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="w-4 h-4 text-accent" />
            Health Score Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between h-24 gap-2">
            {trendData.map((item, index) => (
              <div key={item.month} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className={cn(
                    "w-full rounded-t-md transition-all duration-500",
                    item.value >= 80 ? "bg-success" : "bg-warning"
                  )}
                  style={{
                    height: `${(item.value / 100) * 80}%`,
                    animationDelay: `${index * 0.1}s`,
                  }}
                />
                <span className="text-xs text-muted-foreground">{item.month}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Last 4 months</span>
            <div className="flex items-center gap-1 text-success">
              <TrendingUp className="w-4 h-4" />
              <span className="font-medium">+6.4%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Alerts */}
      <div className="animate-fade-in" style={{ animationDelay: "0.3s" }}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Active Alerts</h2>
          <StatusBadge status="warning" label={`${alertsList.length} alerts`} />
        </div>
        <div className="space-y-3">
          {alertsList.map((alert) => (
            <Card key={alert.id} variant="status" className="overflow-hidden">
              <div className="h-1 bg-warning" />
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="font-medium">{alert.structure}</div>
                    <div className="text-sm text-muted-foreground">{alert.issue}</div>
                    <div className="text-xs text-muted-foreground mt-1">{alert.date}</div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
