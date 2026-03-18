import { ArrowDownRight, ArrowUpRight, Clock3, DatabaseZap, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { PricingItem } from "@/lib/pricing-api";
import { cn } from "@/lib/utils";

interface PricingCardProps {
  item: PricingItem;
}

function formatPrice(value: number | null, currency: string) {
  if (value == null) return "Unavailable";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: value > 100 ? 0 : 2,
  }).format(value);
}

function formatTimestamp(value: string | null) {
  if (!value) return "Unavailable";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function PricingCard({ item }: PricingCardProps) {
  const isAvailable = item.status === "available" && item.price != null;
  const isPositive = (item.changePercent ?? 0) >= 0;
  const ChangeIcon = isPositive ? ArrowUpRight : ArrowDownRight;

  return (
    <Card variant="glass" className="hover-lift">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <h3 className="text-base font-semibold text-foreground">{item.name}</h3>
              <Badge variant="outline">{item.category}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">Proxy for {item.proxyFor.join(" · ")}</p>
          </div>

          <Badge variant={isAvailable ? "secondary" : "outline"} className="shrink-0">
            {isAvailable ? "Live" : "Fallback"}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4 sm:grid-cols-4">
          <div>
            <div className="text-xs text-muted-foreground mb-1">Price</div>
            <div className="text-base font-semibold text-foreground">{formatPrice(item.price, item.currency)}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Currency</div>
            <div className="text-sm font-medium text-foreground">{item.currency}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Updated</div>
            <div className="flex items-center gap-1 text-sm text-foreground">
              <Clock3 className="w-3.5 h-3.5 text-muted-foreground" />
              <span>{formatTimestamp(item.lastUpdated)}</span>
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Move</div>
            {isAvailable && item.changePercent != null ? (
              <div
                className={cn(
                  "inline-flex items-center gap-1 text-sm font-medium",
                  isPositive ? "text-success" : "text-destructive",
                )}
              >
                <ChangeIcon className="w-3.5 h-3.5" />
                <span>{Math.abs(item.changePercent).toFixed(2)}%</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Unavailable</span>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 border-t border-border/60 pt-3 text-xs text-muted-foreground">
          <div className="inline-flex items-center gap-1.5">
            <DatabaseZap className="w-3.5 h-3.5" />
            <span>{item.symbol}</span>
          </div>
          <span>{item.unit}</span>
        </div>
      </CardContent>
    </Card>
  );
}
