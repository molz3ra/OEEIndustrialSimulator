import { useTranslation } from "react-i18next";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatDateTime, formatDurationMinutes } from "@/lib/utils";
import type { DowntimeEvent } from "@shared/schema";
import { ChevronLeft, ChevronRight, History } from "lucide-react";

interface DowntimeTableProps {
  events: DowntimeEvent[];
  page: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
  machineMap?: Record<number, string>;
}

export function DowntimeTable({
  events,
  page,
  totalPages,
  onPageChange,
  machineMap = {},
}: DowntimeTableProps) {
  const { t } = useTranslation();

  return (
    <Card className="border-border shadow-md">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base font-bold flex items-center gap-2">
          <History className="w-4 h-4 text-primary" />
          {t("dashboard.recentEvents")}
        </CardTitle>
        <span className="text-xs text-muted-foreground">
          {events.length} eventos nesta página
        </span>
      </CardHeader>

      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[120px]">{t("dashboard.timestamp")}</TableHead>
              <TableHead className="w-[120px]">{t("common.machine")}</TableHead>
              <TableHead>{t("dashboard.reason")}</TableHead>
              <TableHead className="w-[110px]">{t("dashboard.duration")}</TableHead>
              <TableHead>{t("common.notes")}</TableHead>
              <TableHead className="w-[100px] text-right">{t("common.status")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Nenhum registro de parada encontrado.
                </TableCell>
              </TableRow>
            ) : (
              events.map((event) => {
                const isActive = event.endTime === null;
                const reasonLabel = t(`downtime.reasons.${event.reason}`, {
                  defaultValue: event.reason,
                });
                const machineName = machineMap[event.machineId] || `Máq #${event.machineId}`;

                return (
                  <TableRow key={event.id}>
                    <TableCell className="font-mono text-xs">
                      {formatDateTime(event.startTime)}
                    </TableCell>
                    <TableCell className="font-medium text-xs">
                      {machineName}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-semibold text-xs">
                        {reasonLabel}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs font-semibold">
                      {isActive ? (
                        <span className="text-rose-400 animate-pulse font-bold">
                          Em andamento
                        </span>
                      ) : (
                        formatDurationMinutes(event.durationMinutes)
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-xs truncate">
                      {event.notes || "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant={isActive ? "danger" : "success"}
                        className="text-[10px] font-bold"
                      >
                        {isActive ? "PARADA" : "RESOLVIDA"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {/* Pagination footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <span className="text-xs text-muted-foreground">
              {t("common.page")} {page} {t("common.of")} {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(page - 1)}
                disabled={page <= 1}
                className="h-8 px-2"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(page + 1)}
                disabled={page >= totalPages}
                className="h-8 px-2"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
