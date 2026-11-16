import { Card } from "@/components/ui/card";
import { formatPercent } from "@shared/oee";
import { LucideIcon } from "lucide-react";

interface OEEPillarCardProps {
  title: string;
  value: number; // 0 to 1
  icon: LucideIcon;
  subtitle: string;
  benchmark?: string;
  colorClass?: string;
}

export function OEEPillarCard({
  title,
  value,
  icon: Icon,
  subtitle,
  colorClass = "bg-primary",
}: OEEPillarCardProps) {
  const percentage = Math.min(Math.max(value * 100, 0), 100);

  // Color selection based on standard industrial thresholds
  let barColor = "bg-rose-500";
  let textColor = "text-rose-400";
  if (value >= 0.85) {
    barColor = "bg-emerald-500";
    textColor = "text-emerald-400";
  } else if (value >= 0.7) {
    barColor = "bg-blue-500";
    textColor = "text-blue-400";
  } else if (value >= 0.5) {
    barColor = "bg-amber-500";
    textColor = "text-amber-400";
  }

  return (
    <Card className="p-5 border-border bg-card shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {title}
          </span>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
        <div className="p-2 rounded-lg bg-secondary/80">
          <Icon className="w-5 h-5 text-foreground/80" />
        </div>
      </div>

      <div className="flex items-baseline justify-between">
        <div className={`font-mono text-3xl font-black ${textColor}`}>
          {formatPercent(value)}
        </div>
        <span className="text-[11px] font-medium text-muted-foreground">
          Meta: ≥ 85%
        </span>
      </div>

      {/* Progress Bar */}
      <div className="h-2 w-full bg-secondary/60 rounded-full overflow-hidden">
        <div
          className={`h-full ${barColor} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </Card>
  );
}
