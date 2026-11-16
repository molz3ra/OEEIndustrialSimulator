import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DowntimeForm } from "@/components/downtime/DowntimeForm";
import { DowntimeTimer } from "@/components/downtime/DowntimeTimer";
import { OEEPillarCard } from "@/components/oee/OEEPillarCard";
import { OEEGauge } from "@/components/oee/OEEGauge";
import { useToast } from "@/hooks/use-toast";
import type { Machine, DowntimeEvent } from "@shared/schema";
import type { MachineOEESummary } from "@shared/types";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Clock,
  Gauge,
  Percent,
  Play,
  RotateCcw,
  Sparkles,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function OperatorPage() {
  const { t } = useTranslation();
  const { selectedMachineId } = useAuth();
  const { toast } = useToast();
  const [isDowntimeModalOpen, setIsDowntimeModalOpen] = useState(false);

  // 1. Fetch current machine details
  const { data: machine } = useQuery<Machine>({
    queryKey: [`/api/machines/${selectedMachineId}`],
    enabled: Boolean(selectedMachineId),
    refetchInterval: 10000,
  });

  // 2. Fetch OEE summary & active downtime
  const { data: oeeSummary, isLoading: isSummaryLoading } = useQuery<MachineOEESummary>({
    queryKey: [`/api/oee/summary/${selectedMachineId}`],
    enabled: Boolean(selectedMachineId),
    refetchInterval: 5000,
  });

  // 3. Start Downtime Mutation
  const startDowntimeMutation = useMutation({
    mutationFn: async (data: { reason: string; notes: string }) => {
      return apiRequest<DowntimeEvent>("POST", "/api/downtime/start", {
        machineId: selectedMachineId,
        reason: data.reason,
        notes: data.notes,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/oee/summary/${selectedMachineId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/machines/${selectedMachineId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/machines"] });
      queryClient.invalidateQueries({ queryKey: ["/api/downtime"] });
      setIsDowntimeModalOpen(false);
      toast({
        variant: "destructive",
        title: t("operator.activeDowntime"),
        description: t("operator.downtimeStartedToast"),
      });
    },
    onError: (err: any) => {
      toast({
        variant: "destructive",
        title: t("common.error"),
        description: err.message || "Falha ao registrar parada",
      });
    },
  });

  // 4. End Downtime Mutation
  const endDowntimeMutation = useMutation({
    mutationFn: async (downtimeId: number) => {
      return apiRequest<DowntimeEvent>("POST", `/api/downtime/${downtimeId}/end`, {
        notes: "Retomado pelo operador na linha",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/oee/summary/${selectedMachineId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/machines/${selectedMachineId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/machines"] });
      queryClient.invalidateQueries({ queryKey: ["/api/downtime"] });
      toast({
        variant: "success",
        title: t("common.success"),
        description: t("operator.downtimeEndedToast"),
      });
    },
    onError: (err: any) => {
      toast({
        variant: "destructive",
        title: t("common.error"),
        description: err.message || "Falha ao finalizar parada",
      });
    },
  });

  const activeDowntime = oeeSummary?.activeDowntime;
  const isLineStopped = Boolean(activeDowntime);

  if (!selectedMachineId || !machine) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center space-y-4">
        <Gauge className="w-16 h-16 text-muted-foreground animate-pulse" />
        <h2 className="text-2xl font-bold">{t("operator.selectMachinePrompt")}</h2>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner: Machine Info */}
      <Card className="bg-card/70 border-border shadow-md">
        <CardContent className="p-4 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm font-bold bg-primary/20 text-primary px-2.5 py-0.5 rounded border border-primary/30">
                {machine.code}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-foreground">
                {machine.name}
              </h2>
              <Badge
                variant={isLineStopped ? "danger" : "success"}
                className="text-xs font-bold uppercase tracking-wider"
              >
                {isLineStopped ? "LINHA PARADA" : "EM OPERAÇÃO"}
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {machine.description || "Linha de usinagem industrial contínua"}
            </p>
          </div>

          {/* Machine KPIs info */}
          <div className="flex items-center gap-4 sm:gap-6 border-t md:border-t-0 md:border-l pt-3 md:pt-0 md:pl-6 text-xs sm:text-sm">
            <div>
              <span className="text-muted-foreground block text-[11px] uppercase">
                {t("operator.cycleTimeLabel")}
              </span>
              <span className="font-mono font-bold text-foreground text-base">
                {machine.idealCycleTimeSec}s / peça
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px] uppercase">
                {t("operator.shiftTargetLabel")}
              </span>
              <span className="font-mono font-bold text-foreground text-base">
                {machine.plannedProductionPerShift} peças
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Touch Operation Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Big Touch Action Button & Active Timer (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {isLineStopped && activeDowntime && (
            <DowntimeTimer
              startTime={activeDowntime.startTime}
              reason={activeDowntime.reason}
              notes={activeDowntime.notes}
            />
          )}

          <div className="bg-card p-6 sm:p-8 rounded-xl border border-border shadow-lg flex flex-col items-center justify-center space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Ação de Linha do Operador
            </span>

            {!isLineStopped ? (
              <Button
                variant="industrialDanger"
                size="operator"
                onClick={() => setIsDowntimeModalOpen(true)}
                disabled={startDowntimeMutation.isPending}
                className="h-28 text-2xl flex items-center justify-center gap-4 shadow-red-950/50"
              >
                <ArrowDown className="w-8 h-8 animate-bounce" />
                {t("operator.lineDown")}
              </Button>
            ) : (
              <Button
                variant="industrialSuccess"
                size="operator"
                onClick={() => endDowntimeMutation.mutate(activeDowntime!.id)}
                disabled={endDowntimeMutation.isPending}
                className="h-28 text-2xl flex items-center justify-center gap-4 shadow-emerald-950/50"
              >
                <ArrowUp className="w-8 h-8 animate-bounce" />
                {t("operator.lineUp")}
              </Button>
            )}

            <p className="text-xs text-muted-foreground text-center max-w-sm">
              {!isLineStopped
                ? "Pressione ao interromper a produção por qualquer motivo mecânico, setup ou falta de insumo."
                : "Pressione assim que a máquina for reiniciada e a produção recomeçar."}
            </p>
          </div>

          {/* Quick link to log shift production */}
          <div className="bg-secondary/40 border border-border p-4 rounded-lg flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-primary" />
              <div>
                <h4 className="text-sm font-bold">Encerrando o turno?</h4>
                <p className="text-xs text-muted-foreground">
                  Registre as peças produzidas e refugos para atualizar os cálculos de Performance e Qualidade.
                </p>
              </div>
            </div>
            <Link to="/producao">
              <Button size="sm" variant="outline" className="font-semibold whitespace-nowrap">
                Apontar Produção
              </Button>
            </Link>
          </div>
        </div>

        {/* Right Column: Live OEE Score & Shift Metrics (1 col) */}
        <div className="space-y-4">
          <Card className="bg-card p-6 border-border shadow-md">
            <CardHeader className="p-0 pb-4 text-center">
              <CardTitle className="text-base font-bold">
                {t("oee.title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex flex-col items-center">
              <OEEGauge
                oee={oeeSummary?.currentOEE.oee ?? 1}
                size={190}
                showBenchmark={true}
              />
            </CardContent>
          </Card>

          {/* 3 OEE Pillars */}
          <div className="space-y-3">
            <OEEPillarCard
              title={t("oee.availability")}
              value={oeeSummary?.currentOEE.availability ?? 1}
              icon={Clock}
              subtitle="Tempo de operação real"
            />
            <OEEPillarCard
              title={t("oee.performance")}
              value={oeeSummary?.currentOEE.performance ?? 1}
              icon={Zap}
              subtitle="Velocidade vs Ciclo Ideal"
            />
            <OEEPillarCard
              title={t("oee.quality")}
              value={oeeSummary?.currentOEE.quality ?? 1}
              icon={CheckCircle2}
              subtitle="Peças boas sem refugo"
            />
          </div>
        </div>
      </div>

      {/* Downtime Registration Modal */}
      <DowntimeForm
        open={isDowntimeModalOpen}
        onClose={() => setIsDowntimeModalOpen(false)}
        onSubmit={(reason, notes) =>
          startDowntimeMutation.mutate({ reason, notes })
        }
        machineName={machine.name}
        isSubmitting={startDowntimeMutation.isPending}
      />
    </div>
  );
}
