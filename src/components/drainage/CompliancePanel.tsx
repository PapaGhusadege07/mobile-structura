import { useMemo } from "react";
import { CheckCircle, XCircle, AlertTriangle, Shield, BookOpen } from "lucide-react";
import { type DrainageNetwork, runNBCCompliance, type ComplianceCheck } from "@/lib/drainage-calculations";

interface CompliancePanelProps {
  network: DrainageNetwork | null;
}

const STATUS_ICONS = {
  pass: CheckCircle,
  fail: XCircle,
  warn: AlertTriangle,
};
const STATUS_COLORS = {
  pass: "text-success",
  fail: "text-destructive",
  warn: "text-warning",
};
const STATUS_BG = {
  pass: "bg-success/10 border-success/20",
  fail: "bg-destructive/10 border-destructive/20",
  warn: "bg-warning/10 border-warning/20",
};

export function CompliancePanel({ network }: CompliancePanelProps) {
  const checks = useMemo(() => (network ? runNBCCompliance(network) : []), [network]);

  const passCount = checks.filter((c) => c.status === "pass").length;
  const failCount = checks.filter((c) => c.status === "fail").length;
  const warnCount = checks.filter((c) => c.status === "warn").length;

  if (!network) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 text-center">
        <Shield className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
        <p className="text-sm font-medium text-foreground mb-1">NBC / BBMP Compliance</p>
        <p className="text-xs text-muted-foreground">
          Run the Auto-Optimizer on the Design Canvas to generate a network, then check compliance here.
        </p>
      </div>
    );
  }

  const score = Math.round((passCount / checks.length) * 100);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-accent" />
            <h3 className="text-sm font-semibold text-foreground">Compliance Report</h3>
          </div>
          <div className={`text-lg font-bold font-mono ${score >= 85 ? "text-success" : score >= 60 ? "text-warning" : "text-destructive"}`}>
            {score}%
          </div>
        </div>

        {/* Summary pills */}
        <div className="flex gap-2 mb-3">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-success/10 border border-success/20 text-xs font-medium text-success">
            <CheckCircle className="w-3 h-3" />
            {passCount} Pass
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-warning/10 border border-warning/20 text-xs font-medium text-warning">
            <AlertTriangle className="w-3 h-3" />
            {warnCount} Warn
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-destructive/10 border border-destructive/20 text-xs font-medium text-destructive">
            <XCircle className="w-3 h-3" />
            {failCount} Fail
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${score >= 85 ? "bg-success" : score >= 60 ? "bg-warning" : "bg-destructive"}`}
            style={{ width: `${score}%` }}
          />
        </div>

        {/* Standards note */}
        <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
          <BookOpen className="w-3 h-3" />
          NBC 2016 Part 9 · IS:1172 · IS:3114 · BBMP Drainage Manual 2020
        </div>
      </div>

      {/* Checks list */}
      <div className="space-y-2">
        {checks.map((check) => {
          const Icon = STATUS_ICONS[check.status];
          return (
            <div
              key={check.rule}
              className={`rounded-xl border p-3 ${STATUS_BG[check.status]}`}
            >
              <div className="flex items-start gap-3">
                <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${STATUS_COLORS[check.status]}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <p className="text-sm font-medium text-foreground truncate">{check.rule}</p>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-mono text-foreground">{check.value}</span>
                      <span className="text-[10px] text-muted-foreground">/ {check.limit}</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground mb-1">{check.clause}</p>
                  <p className="text-xs text-muted-foreground">{check.note}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
