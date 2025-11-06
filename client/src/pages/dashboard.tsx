import StatCard from "@/components/StatCard";
import DowntimeChart from "@/components/DowntimeChart";
import DowntimeDistribution from "@/components/DowntimeDistribution";
import DowntimeEventsTable from "@/components/DowntimeEventsTable";
import { Clock, Activity, TrendingUp, AlertTriangle } from "lucide-react";

export default function DashboardPage() {
  const chartData = [
    { reason: "Mechanical Failure", duration: 145, count: 8 },
    { reason: "Tool Changeover (Setup)", duration: 98, count: 12 },
    { reason: "Material Shortage", duration: 67, count: 5 },
    { reason: "Electrical Maintenance", duration: 42, count: 3 },
  ];

  const distributionData = [
    { reason: "Mechanical Failure", percentage: 41, color: "hsl(210, 85%, 32%)" },
    { reason: "Tool Changeover", percentage: 28, color: "hsl(28, 92%, 45%)" },
    { reason: "Material Shortage", percentage: 19, color: "hsl(142, 76%, 36%)" },
    { reason: "Electrical Maintenance", percentage: 12, color: "hsl(262, 83%, 58%)" },
  ];

  const eventsData = [
    {
      id: 1,
      timestamp: "2025-01-06 14:23",
      reason: "Mechanical Failure",
      duration: "00:45:12",
      notes: "Roller X broke, waiting for replacement",
      status: "active" as const,
    },
    {
      id: 2,
      timestamp: "2025-01-06 12:15",
      reason: "Tool Changeover (Setup)",
      duration: "00:18:34",
      notes: "Switching from part A to part B",
      status: "resolved" as const,
    },
    {
      id: 3,
      timestamp: "2025-01-06 09:42",
      reason: "Material Shortage",
      duration: "01:12:08",
      notes: "Waiting for steel delivery",
      status: "resolved" as const,
    },
    {
      id: 4,
      timestamp: "2025-01-06 07:30",
      reason: "Electrical Maintenance",
      duration: "00:25:45",
      notes: "Routine inspection",
      status: "resolved" as const,
    },
    {
      id: 5,
      timestamp: "2025-01-05 16:20",
      reason: "Mechanical Failure",
      duration: "00:32:15",
      notes: "Belt adjustment required",
      status: "resolved" as const,
    },
  ];

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
          <StatCard title="Total Downtime" value="4.2h" icon={Clock} subtitle="Last 24 hours" />
          <StatCard title="Events Today" value="12" icon={Activity} />
          <StatCard title="Avg Duration" value="21m" icon={TrendingUp} />
          <StatCard title="Active Now" value="1" icon={AlertTriangle} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DowntimeChart data={chartData} />
          <DowntimeDistribution data={distributionData} />
        </div>

        <DowntimeEventsTable events={eventsData} />
      </div>
    </div>
  );
}
