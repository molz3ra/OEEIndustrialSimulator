import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertTriangle } from "lucide-react";

interface DowntimeFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (reason: string, notes: string) => void;
  machineName?: string;
  isSubmitting?: boolean;
}

const DOWNTIME_REASONS = [
  "mechanical_failure",
  "electrical_failure",
  "material_shortage",
  "tool_changeover",
  "planned_maintenance",
  "quality_issue",
  "operator_absence",
  "other",
] as const;

export function DowntimeForm({
  open,
  onClose,
  onSubmit,
  machineName,
  isSubmitting = false,
}: DowntimeFormProps) {
  const { t } = useTranslation();
  const [reason, setReason] = useState<string>("");
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) return;
    onSubmit(reason, notes);
    setReason("");
    setNotes("");
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="sm:max-w-lg bg-card border-border">
        <DialogHeader>
          <div className="flex items-center gap-2 text-rose-500 mb-1">
            <AlertTriangle className="w-5 h-5" />
            <DialogTitle className="text-xl">
              {t("operator.reportDowntime")}
            </DialogTitle>
          </div>
          <DialogDescription>
            {machineName
              ? `Máquina selecionada: ${machineName}. Informe a causa do desligamento.`
              : t("operator.downtimeReason")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="downtime-reason" className="text-sm font-semibold">
              {t("operator.downtimeReason")} *
            </Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger id="downtime-reason" className="h-12 text-base">
                <SelectValue placeholder={t("operator.reasonPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                {DOWNTIME_REASONS.map((r) => (
                  <SelectItem key={r} value={r} className="py-2.5">
                    {t(`downtime.reasons.${r}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="downtime-notes" className="text-sm font-semibold">
              {t("common.notes")} (Opcional)
            </Label>
            <Textarea
              id="downtime-notes"
              placeholder="Ex: Quebra do inserto de metal duro na operação 2, fuso travado..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="h-28 resize-none text-sm"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              {t("common.cancel")}
            </Button>
            <Button
              type="submit"
              variant="industrialDanger"
              className="h-11 px-6 font-bold"
              disabled={!reason || isSubmitting}
            >
              {isSubmitting ? t("common.loading") : t("operator.startDowntime")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
