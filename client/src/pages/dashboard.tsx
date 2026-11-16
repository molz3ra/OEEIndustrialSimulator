import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DowntimeChart } from "@/components/downtime/DowntimeChart";
import { OEETrendChart } from "@/components/oee/OEETrendChart";
import { DowntimeTable } from "@/components/downtime/DowntimeTable";
import { OEEGauge } from "@/components/oee/OEEGauge";
import { formatDurationMinutes } from "@/lib/utils";
import type { Machine, DowntimeEvent } from "@shared/schema";
import type {
  DowntimeReasonBreakdown,
  DowntimeStatistics,
  MachineOEESummary,
  OEETrendPoint,
  PaginatedResult,
} from "@shared/types";
import {
  Activity,
  AlertTriangle,
  Clock,
  Gauge,
  SlidersHorizontal,
  TrendingUp,
} from "lucide-react";

export default function DashboardPage() {
  const { t } = useTranslation();
  const { selectedMachineId, setSelectedMachineId } = useAuth();
  const [filterMachineId, setFilterMachineId] = useState<number | "all">("all");
  const [tablePage, setTablePage] = useState(1);

  // 1. Fetch all machines for filters and tags
  const { data: machines = [] } = useQuery<Machine[]>({
    queryKey: ["/api/machines"],
    refetchInterval: 15000,
  });

  const machineMap = machines.reduce<Record<number, string>>((acc, m) => {
    acc[m.id] = `${m.code} - ${m.name}`;
    return acc;
  }, {});

  // 2. Fetch Global Fleet OEE Overview
  const { data: fleetOverview = [] } = useQuery<MachineOEESummary[]>({
    queryKey: ["/api/oee/overview"],
    refetchInterval: 10000,
  });

  // 3. Fetch Downtime Statistics
  const machineParam =
    filterMachineId === "all" ? "" : `?machineId=${filterMachineId}`;
  const { data: statistics } = useQuery<DowntimeStatistics>({
    queryKey: [`/api/downtime/statistics${machineParam}`],
    refetchInterval: 10000,
  });

  // 4. Fetch Downtime by reason (Pareto)
  const { data: byReason = [] } = useQuery<DowntimeReasonBreakdown[]>({
    queryKey: [`/api/downtime/by-reason${machineParam}`],
    refetchInterval: 10000,
  });

  // 5. Fetch Downtime Events (Paginated)
  const tableMachineParam =
    filterMachineId === "all" ? "" : `&machineId=${filterMachineId}`;
  const { data: eventsData } = useQuery<PaginatedResult<DowntimeEvent>>({
    queryKey: [`/api/downtime/events?page=${tablePage}&limit=10${tableMachineParam}`],
    refetchInterval: 10000,
  });

  // 6. Fetch OEE Trend (for selected machine or first machine)
  const trendMachineId =
    filterMachineId === "all"
      ? selectedMachineId || (machines[0]?.id ?? 1)
      : filterMachineId;
  const { data: trendData = [] } = useQuery<OEETrendPoint[]>({
    queryKey: [`/api/oee/trend/${trendMachineId}?days=10`],
    enabled: Boolean(trendMachineId),
    refetchInterval: 15000,
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header and Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
            {t("dashboard.title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("dashboard.subtitle")}
          </p>
        </div>

        {/* Machine Filter Dropdown */}
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
          <Select
            value={filterMachineId.toString()}
            onValueChange={(val) => {
              setFilterMachineId(val === "all" ? "all" : parseInt(val, 10));
              setTablePage(1);
            }}
          >
            <SelectTrigger className="w-48 sm:w-56 h-10 bg-card border-border">
              <SelectValue placeholder={t("dashboard.filterByMachine")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("dashboard.allMachines")}</SelectItem>
              {machines.map((m) => (
                <SelectItem key={m.id} value={m.id.toString()}>
                  {m.code} - {m.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Fleet Overview Cards (Cards for each machine) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {fleetOverview.map((item) => {
          const isSelected =
            filterMachineId === item.machine.id ||
            (filterMachineId === "all" && selectedMachineId === item.machine.id);

          return (
            <Card
              key={item.machine.id}
              onClick={() => {
                setFilterMachineId(item.machine.id);
                setSelectedMachineId(item.machine.id);
              }}
              className={`p-4 cursor-pointer transition-all border-border hover:border-primary/50 ${
                isSelected ? "ring-2 ring-primary bg-primary/5" : "bg-card"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-secondary">
                      {item.machine.code}
                    </span>
                    <Badge
                      variant={
                        item.machine.status === "running"
                          ? "success"
                          : item.machine.status === "stopped"
                          ? "danger"
                          : "warning"
                      }
                      className="text-[10px] font-bold uppercase"
                    >
                      {item.machine.status}
                    </Badge>
                  </div>
                  <h4 className="font-bold text-sm text-foreground line-clamp-1">
                    {item.machine.name}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Perdas hoje: {formatDurationMinutes(item.recentDowntimeMinutes)}
                  </p>
                </div>

                <div className="shrink-0">
                  <OEEGauge
                    oee={item.currentOEE.oee}
                    size={80}
                    showBenchmark={false}
                  />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 border-border bg-card shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-muted-foreground">
              {t("dashboard.totalDowntime")}
            </span>
            <Clock className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="font-mono text-3xl font-black text-rose-400 mt-2">
            {formatDurationMinutes(statistics?.totalDurationMinutes)}
          </div>
          <span className="text-[11px] text-muted-foreground">
            Período acumulado
          </span>
        </Card>

        <Card className="p-5 border-border bg-card shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-muted-foreground">
              {t("dashboard.totalEvents")}
            </span>
            <Activity className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="font-mono text-3xl font-black text-foreground mt-2">
            {statistics?.eventCount || 0}
          </div>
          <span className="text-[11px] text-muted-foreground">
            Ocorrências registradas
          </span>
        </Card>

        <Card className="p-5 border-border bg-card shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-muted-foreground">
              {t("dashboard.avgDuration")}
            </span>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="font-mono text-3xl font-black text-amber-400 mt-2">
            {statistics?.avgDurationMinutes || 0}m
          </div>
          <span className="text-[11px] text-muted-foreground">
            Tempo médio por parada
          </span>
        </Card>

        <Card className="p-5 border-border bg-card shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-muted-foreground">
              {t("dashboard.activeNow")}
            </span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="font-mono text-3xl font-black text-rose-500 mt-2">
            {statistics?.activeCount || 0}
          </div>
          <span className="text-[11px] text-muted-foreground">
            Máquinas paradas agora
          </span>
        </Card>
      </div>

      {/* Analytics Charts (Pareto + OEE Trend) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DowntimeChart data={byReason} />
        <OEETrendChart data={trendData} />
      </div>

      {/* Historical Downtime Events Table */}
      <DowntimeTable
        events={eventsData?.data || []}
        page={tablePage}
        totalPages={eventsData?.totalPages || 1}
        onPageChange={setTablePage}
        machineMap={machineMap}
      />
    </div>
  );
}
