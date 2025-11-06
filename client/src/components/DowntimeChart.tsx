import { Card } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

interface DowntimeData {
  reason: string;
  duration: number;
  count: number;
}

interface DowntimeChartProps {
  data: DowntimeData[];
}

export default function DowntimeChart({ data }: DowntimeChartProps) {
  const maxDuration = Math.max(...data.map(d => d.duration));

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Top Downtime Reasons</h3>
          <BarChart3 className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="space-y-4">
          {data.map((item, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{item.reason}</span>
                <div className="flex items-center gap-4">
                  <span className="text-muted-foreground">{item.count} events</span>
                  <span className="font-mono font-semibold">{item.duration}m</span>
                </div>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-chart-1 rounded-full transition-all"
                  style={{ width: `${(item.duration / maxDuration) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
