import { Card } from "@/components/ui/card";
import { PieChart } from "lucide-react";

interface DistributionData {
  reason: string;
  percentage: number;
  color: string;
}

interface DowntimeDistributionProps {
  data: DistributionData[];
}

export default function DowntimeDistribution({ data }: DowntimeDistributionProps) {
  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Downtime Distribution</h3>
          <PieChart className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="space-y-3">
          {data.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm font-medium">{item.reason}</span>
              </div>
              <span className="font-mono text-sm font-semibold">{item.percentage}%</span>
            </div>
          ))}
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden flex">
          {data.map((item, index) => (
            <div
              key={index}
              className="h-full"
              style={{
                width: `${item.percentage}%`,
                backgroundColor: item.color,
              }}
            />
          ))}
        </div>
      </div>
    </Card>
  );
}
