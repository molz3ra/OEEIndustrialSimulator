import { useQuery } from "@tanstack/react-query";
import StatCard from "@/components/StatCard";
import DowntimeChart from "@/components/DowntimeChart";
import DowntimeDistribution from "@/components/DowntimeDistribution";
import DowntimeEventsTable from "@/components/DowntimeEventsTable";
import { Clock, Activity, TrendingUp, AlertTriangle } from "lucide-react";

type DowntimeEvent = {
  id: number;
  reason: string;
  notes: string;
  startTime: string;
  endTime: string | null;
  duration: number | null;
};

type Statistics = {
  totalDuration: number;
  eventCount: number;
  avgDuration: number;
  activeCount: number;
};

type ReasonData = {
  reason: string;
  duration: number;
  count: number;
};

const CHART_COLORS = [
  "hsl(210, 85%, 32%)",
  "hsl(28, 92%, 45%)",
  "hsl(142, 76%, 36%)",
  "hsl(262, 83%, 58%)",
  "hsl(340, 82%, 52%)",
];

export default function DashboardPage() {
  const { data: statistics, isLoading: statsLoading } = useQuery<Statistics>({
    queryKey: ["/api/downtime/statistics"],
    refetchInterval: 10000,
  });

  const { data: byReason, isLoading: reasonLoading } = useQuery<ReasonData[]>({
    queryKey: ["/api/downtime/by-reason"],
    refetchInterval: 10000,
  });

  const { data: events, isLoading: eventsLoading } = useQuery<DowntimeEvent[]>({
    queryKey: ["/api/downtime/events"],
    refetchInterval: 10000,
  });

  const formatDuration = (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const formatEventDuration = (minutes: number | null): string => {
    if (minutes === null) return "-";
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    const s = 0;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const formatTimestamp = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleString("en-US", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const totalDuration = byReason?.reduce((sum, item) => sum + item.duration, 0) || 1;
  const distributionData = byReason?.map((item, index) => ({
    reason: item.reason,
    percentage: Math.round((item.duration / totalDuration) * 100),
    color: CHART_COLORS[index % CHART_COLORS.length],
  })) || [];

  const tableData = events?.map(event => ({
    id: event.id,
    timestamp: formatTimestamp(event.startTime),
    reason: event.reason,
    duration: formatEventDuration(event.duration),
    notes: event.notes || "",
    status: (event.endTime ? "resolved" : "active") as "active" | "resolved",
  })) || [];

  const isLoading = statsLoading || reasonLoading || eventsLoading;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">OEE Dashboard</h1>
          <p className="text-muted-foreground text-lg">
            Overall Equipment Effectiveness - Loss Analysis
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Downtime"
            value={statistics ? formatDuration(statistics.totalDuration) : "-"}
            icon={Clock}
            subtitle="All events"
          />
          <StatCard
            title="Events Total"
            value={statistics?.eventCount || 0}
            icon={Activity}
          />
          <StatCard
            title="Avg Duration"
            value={statistics ? `${statistics.avgDuration}m` : "-"}
            icon={TrendingUp}
          />
          <StatCard
            title="Active Now"
            value={statistics?.activeCount || 0}
            icon={AlertTriangle}
          />
        </div>

        {!isLoading && byReason && byReason.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DowntimeChart data={byReason} />
            <DowntimeDistribution data={distributionData} />
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            {isLoading ? "Loading analytics..." : "No downtime events recorded yet"}
          </div>
        )}

        {!eventsLoading && tableData.length > 0 && (
          <DowntimeEventsTable events={tableData} />
        )}
      </div>
    </div>
  );
}
