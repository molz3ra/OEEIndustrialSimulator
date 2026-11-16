import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { OEEGauge } from "@/components/oee/OEEGauge";
import { useToast } from "@/hooks/use-toast";
import { calculateOEE, formatPercent } from "@shared/oee";
import type { Machine, ProductionRecord } from "@shared/schema";
import type { PaginatedResult } from "@shared/types";
import { FileSpreadsheet, PlusCircle } from "lucide-react";

export default function ProductionPage() {
  const { t } = useTranslation();
  const { selectedMachineId } = useAuth();
  const { toast } = useToast();

  const [machineId, setMachineId] = useState<number>(selectedMachineId || 1);
  const [shiftDate, setShiftDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [shift, setShift] = useState<"morning" | "afternoon" | "night">("morning");
  const [plannedQty, setPlannedQty] = useState(450);
  const [producedQty, setProducedQty] = useState(420);
  const [goodQty, setGoodQty] = useState(405);
  const [defectiveQty, setDefectiveQty] = useState(15);
  const [plannedTimeMinutes, setPlannedTimeMinutes] = useState(480);
  const [actualRunTimeMinutes, setActualRunTimeMinutes] = useState(430);

  // 1. Fetch machines
  const { data: machines = [] } = useQuery<Machine[]>({
    queryKey: ["/api/machines"],
  });

  const currentMachine = machines.find((m) => m.id === machineId);

  // 2. Fetch past production records
  const { data: recordsData } = useQuery<PaginatedResult<ProductionRecord>>({
    queryKey: [`/api/production?machineId=${machineId}&limit=10`],
    refetchInterval: 10000,
  });

  // 3. Live OEE preview calculation
  const liveOEE = useMemo(() => {
    return calculateOEE({
      plannedTimeMinutes,
      actualRunTimeMinutes,
      idealCycleTimeSec: currentMachine?.idealCycleTimeSec || 60,
      producedQuantity: producedQty,
      goodQuantity: goodQty,
    });
  }, [
    plannedTimeMinutes,
    actualRunTimeMinutes,
    currentMachine,
    producedQty,
    goodQty,
  ]);

  // 4. Mutation to create production entry
  const createMutation = useMutation({
    mutationFn: async () => {
      return apiRequest<ProductionRecord>("POST", "/api/production", {
        machineId,
        shiftDate,
        shift,
        plannedQuantity: plannedQty,
        producedQuantity: producedQty,
        goodQuantity: goodQty,
        defectiveQuantity: defectiveQty,
        plannedTimeMinutes,
        actualRunTimeMinutes,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/production"] });
      queryClient.invalidateQueries({ queryKey: ["/api/oee"] });
      toast({
        variant: "success",
        title: t("common.success"),
        description: t("production.savedToast"),
      });
    },
    onError: (err: any) => {
      toast({
        variant: "destructive",
        title: t("common.error"),
        description: err.message || "Falha ao registrar produção",
      });
    },
  });

  const handleProducedChange = (val: number) => {
    setProducedQty(val);
    // auto-adjust good quantity if greater than produced
    if (goodQty > val) {
      setGoodQty(val);
      setDefectiveQty(0);
    } else {
      setDefectiveQty(Math.max(0, val - goodQty));
    }
  };

  const handleGoodChange = (val: number) => {
    setGoodQty(val);
    setDefectiveQty(Math.max(0, producedQty - val));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
          {t("production.title")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t("production.subtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Entry (2 cols) */}
        <Card className="lg:col-span-2 border-border shadow-md bg-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-primary" />
              {t("production.recordProduction")}
            </CardTitle>
            <CardDescription>
              Preencha os valores contados ao final do turno de fabricação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                createMutation.mutate();
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>{t("common.machine")}</Label>
                  <Select
                    value={machineId.toString()}
                    onValueChange={(val) => {
                      const id = parseInt(val, 10);
                      setMachineId(id);
                      const m = machines.find((mach) => mach.id === id);
                      if (m) {
                        setPlannedQty(m.plannedProductionPerShift);
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {machines.map((m) => (
                        <SelectItem key={m.id} value={m.id.toString()}>
                          {m.code} - {m.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{t("common.date")}</Label>
                  <Input
                    type="date"
                    value={shiftDate}
                    onChange={(e) => setShiftDate(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t("common.shift")}</Label>
                  <Select
                    value={shift}
                    onValueChange={(val: any) => setShift(val)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning">Manhã (1º Turno)</SelectItem>
                      <SelectItem value="afternoon">Tarde (2º Turno)</SelectItem>
                      <SelectItem value="night">Noite (3º Turno)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Quantities */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                <div className="space-y-2">
                  <Label className="text-xs">{t("production.plannedQuantity")}</Label>
                  <Input
                    type="number"
                    min="0"
                    value={plannedQty}
                    onChange={(e) => setPlannedQty(parseInt(e.target.value) || 0)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">{t("production.producedQuantity")}</Label>
                  <Input
                    type="number"
                    min="0"
                    value={producedQty}
                    onChange={(e) => handleProducedChange(parseInt(e.target.value) || 0)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-emerald-400 font-semibold">
                    {t("production.goodQuantity")}
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    max={producedQty}
                    value={goodQty}
                    onChange={(e) => handleGoodChange(parseInt(e.target.value) || 0)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-rose-400 font-semibold">
                    {t("production.defectiveQuantity")}
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    value={defectiveQty}
                    onChange={(e) => {
                      const def = parseInt(e.target.value) || 0;
                      setDefectiveQty(def);
                      setGoodQty(Math.max(0, producedQty - def));
                    }}
                    required
                  />
                </div>
              </div>

              {/* Operating Times */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-2">
                  <Label className="text-xs">{t("production.plannedTimeMinutes")}</Label>
                  <Input
                    type="number"
                    min="1"
                    value={plannedTimeMinutes}
                    onChange={(e) => setPlannedTimeMinutes(parseInt(e.target.value) || 480)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">{t("production.actualRunTimeMinutes")}</Label>
                  <Input
                    type="number"
                    min="1"
                    max={plannedTimeMinutes}
                    value={actualRunTimeMinutes}
                    onChange={(e) => setActualRunTimeMinutes(parseInt(e.target.value) || 480)}
                    required
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <Button
                  type="submit"
                  size="lg"
                  className="font-bold gap-2 px-8"
                  disabled={createMutation.isPending}
                >
                  <PlusCircle className="w-5 h-5" />
                  {createMutation.isPending ? t("common.loading") : t("common.save")}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Live Calculation Preview Card (1 col) */}
        <Card className="border-border shadow-md bg-card flex flex-col justify-between">
          <CardHeader className="pb-2 text-center">
            <CardTitle className="text-base font-bold">
              {t("production.calculatedOEE")}
            </CardTitle>
            <CardDescription className="text-xs">
              Cálculo instantâneo baseado nas quantidades preenchidas
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <OEEGauge oee={liveOEE.oee} size={180} showBenchmark={true} />

            <div className="w-full space-y-2 pt-2 border-t text-xs">
              <div className="flex justify-between font-mono">
                <span className="text-muted-foreground">{t("oee.availability")}:</span>
                <span className="font-bold text-emerald-400">
                  {formatPercent(liveOEE.availability)}
                </span>
              </div>
              <div className="flex justify-between font-mono">
                <span className="text-muted-foreground">{t("oee.performance")}:</span>
                <span className="font-bold text-amber-400">
                  {formatPercent(liveOEE.performance)}
                </span>
              </div>
              <div className="flex justify-between font-mono">
                <span className="text-muted-foreground">{t("oee.quality")}:</span>
                <span className="font-bold text-purple-400">
                  {formatPercent(liveOEE.quality)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Production History Table */}
      <Card className="border-border shadow-md bg-card">
        <CardHeader>
          <CardTitle className="text-base font-bold">
            Histórico Recente de Apontamentos
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("common.date")}</TableHead>
                <TableHead>{t("common.shift")}</TableHead>
                <TableHead>Produzidas</TableHead>
                <TableHead>Boas / Refugo</TableHead>
                <TableHead>Tempo Real</TableHead>
                <TableHead>D / P / Q</TableHead>
                <TableHead className="text-right">OEE Geral</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(recordsData?.data || []).map((rec) => (
                <TableRow key={rec.id}>
                  <TableCell className="font-mono text-xs">{rec.shiftDate}</TableCell>
                  <TableCell className="text-xs capitalize">{rec.shift}</TableCell>
                  <TableCell className="font-mono text-xs font-semibold">
                    {rec.producedQuantity} / {rec.plannedQuantity}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    <span className="text-emerald-400 font-bold">{rec.goodQuantity}</span>
                    {" / "}
                    <span className="text-rose-400">{rec.defectiveQuantity}</span>
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {rec.actualRunTimeMinutes}m
                  </TableCell>
                  <TableCell className="font-mono text-[11px] text-muted-foreground">
                    {formatPercent(rec.availability)} | {formatPercent(rec.performance)} | {formatPercent(rec.quality)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant="outline" className="font-mono font-bold text-xs text-primary border-primary/40">
                      {formatPercent(rec.oee)}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
