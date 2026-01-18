import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { Building2, Calendar, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScanRecord {
  id: string;
  structureName: string;
  date: string;
  status: "healthy" | "warning" | "critical";
  score: number;
}

const mockScans: ScanRecord[] = [
  {
    id: "1",
    structureName: "Downtown Office Tower",
    date: "2 hours ago",
    status: "healthy",
    score: 94,
  },
  {
    id: "2",
    structureName: "Riverside Bridge",
    date: "Yesterday",
    status: "warning",
    score: 72,
  },
  {
    id: "3",
    structureName: "Central Station",
    date: "3 days ago",
    status: "healthy",
    score: 88,
  },
];

interface ScanHistoryProps {
  onSelectScan?: (scan: ScanRecord) => void;
}

export function ScanHistory({ onSelectScan }: ScanHistoryProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Recent Scans</h2>
        <button className="text-sm text-accent font-medium">View All</button>
      </div>
      <div className="space-y-3">
        {mockScans.map((scan, index) => (
          <Card
            key={scan.id}
            variant="default"
            className={cn(
              "cursor-pointer hover:shadow-card-hover active:scale-[0.98] transition-all",
              "animate-fade-in"
            )}
            style={{ animationDelay: `${index * 0.1}s` }}
            onClick={() => onSelectScan?.(scan)}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <Building2 className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">{scan.structureName}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-3.5 h-3.5" />
                    {scan.date}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-lg font-bold font-mono">{scan.score}</div>
                    <StatusBadge status={scan.status} className="text-xs py-0.5 px-2" />
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
