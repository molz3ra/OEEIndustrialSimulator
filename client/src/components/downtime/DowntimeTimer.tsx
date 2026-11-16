import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Clock } from "lucide-react";

interface DowntimeTimerProps {
  startTime: string | Date;
  reason: string;
  notes?: string | null;
}

export function DowntimeTimer({ startTime, reason, notes }: DowntimeTimerProps) {
  const { t } = useTranslation();
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const startDate = typeof startTime === "string" ? new Date(startTime) : startTime;

    const updateTimer = () => {
      const now = new Date();
      const diffSec = Math.max(0, Math.floor((now.getTime() - startDate.getTime()) / 1000));
      setElapsedSeconds(diffSec);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  const hours = Math.floor(elapsedSeconds / 3600);
  const minutes = Math.floor((elapsedSeconds % 3600) / 60);
  const seconds = elapsedSeconds % 60;

  const formattedTime = `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

  const reasonLabel = t(`downtime.reasons.${reason}`, { defaultValue: reason });

  return (
    <Card className="border-rose-600/50 bg-rose-950/20 p-6 shadow-xl animate-in fade-in duration-300">
      <div className="flex flex-col items-center text-center space-y-3">
        <div className="flex items-center gap-2 text-rose-400 font-semibold uppercase tracking-wider text-sm">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
          </span>
          <AlertCircle className="w-4 h-4" />
          {t("operator.activeDowntime")}
        </div>

        <div className="font-mono text-5xl md:text-6xl font-black text-rose-500 tracking-tight">
          {formattedTime}
        </div>

        <div className="space-y-1">
          <Badge variant="danger" className="text-sm px-3 py-1 font-bold">
            {reasonLabel}
          </Badge>
          {notes && (
            <p className="text-xs text-muted-foreground italic max-w-md pt-1">
              "{notes}"
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
