import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import type { Machine } from "@shared/schema";
import { Cog, Plus } from "lucide-react";

export default function MachinesPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [cycleTime, setCycleTime] = useState(60);
  const [target, setTarget] = useState(480);

  const { data: machines = [], isLoading } = useQuery<Machine[]>({
    queryKey: ["/api/machines"],
    refetchInterval: 15000,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      return apiRequest<Machine>("POST", "/api/machines", {
        name,
        code,
        description,
        idealCycleTimeSec: cycleTime,
        plannedProductionPerShift: target,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/machines"] });
      setIsDialogOpen(false);
      setName("");
      setCode("");
      setDescription("");
      toast({
        variant: "success",
        title: t("common.success"),
        description: "Máquina cadastrada com sucesso!",
      });
    },
    onError: (err: any) => {
      toast({
        variant: "destructive",
        title: t("common.error"),
        description: err.message || "Falha ao cadastrar máquina",
      });
    },
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
            {t("machines.title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("machines.subtitle")}
          </p>
        </div>

        <Button onClick={() => setIsDialogOpen(true)} className="gap-2 font-bold">
          <Plus className="w-4 h-4" />
          {t("machines.newMachine")}
        </Button>
      </div>

      <Card className="border-border shadow-md bg-card">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tag / Código</TableHead>
                <TableHead>{t("machines.name")}</TableHead>
                <TableHead>{t("machines.idealCycle")}</TableHead>
                <TableHead>{t("machines.shiftTarget")}</TableHead>
                <TableHead>{t("common.notes")}</TableHead>
                <TableHead className="text-right">{t("machines.status")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {machines.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="font-mono font-bold text-xs text-primary">
                    {m.code}
                  </TableCell>
                  <TableCell className="font-bold text-sm text-foreground">
                    {m.name}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {m.idealCycleTimeSec}s
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {m.plannedProductionPerShift} un
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-sm truncate">
                    {m.description || "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge
                      variant={
                        m.status === "running"
                          ? "success"
                          : m.status === "stopped"
                          ? "danger"
                          : "warning"
                      }
                      className="text-[10px] font-bold uppercase"
                    >
                      {m.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Machine Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle>{t("machines.newMachine")}</DialogTitle>
            <DialogDescription>
              Cadastre novos equipamentos para acompanhamento de linha e OEE
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              createMutation.mutate();
            }}
            className="space-y-4 py-2"
          >
            <div className="space-y-2">
              <Label>{t("machines.name")}</Label>
              <Input
                placeholder="Ex: Prensa Dobradeira CNC 150T"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>{t("machines.code")}</Label>
              <Input
                placeholder="Ex: DOB-04"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("machines.idealCycle")}</Label>
                <Input
                  type="number"
                  min="1"
                  value={cycleTime}
                  onChange={(e) => setCycleTime(parseInt(e.target.value) || 60)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>{t("machines.shiftTarget")}</Label>
                <Input
                  type="number"
                  min="1"
                  value={target}
                  onChange={(e) => setTarget(parseInt(e.target.value) || 480)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t("common.notes")}</Label>
              <Input
                placeholder="Descrição técnica ou localização..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                {t("common.cancel")}
              </Button>
              <Button
                type="submit"
                className="font-bold px-6"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? t("common.loading") : t("common.save")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
