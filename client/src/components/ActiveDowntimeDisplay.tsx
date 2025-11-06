import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Clock } from "lucide-react";

interface ActiveDowntimeDisplayProps {
  startTime: Date;
  reason: string;
  notes?: string;
}

export default function ActiveDowntimeDisplay({ startTime, reason, notes }: ActiveDowntimeDisplayProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime.getTime()) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <Card className="p-8 border-destructive bg-destructive/5">
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-destructive">
          <Clock className="h-5 w-5 animate-pulse" />
          <span className="text-sm font-medium uppercase tracking-wide">Active Downtime</span>
        </div>
        <div className="space-y-2">
          <div className="font-mono text-5xl font-bold text-destructive" data-testid="text-elapsed-time">
            {formatTime(elapsed)}
          </div>
          <div className="text-lg font-medium" data-testid="text-downtime-reason">
            {reason}
          </div>
          {notes && (
            <div className="text-sm text-muted-foreground" data-testid="text-downtime-notes">
              {notes}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
