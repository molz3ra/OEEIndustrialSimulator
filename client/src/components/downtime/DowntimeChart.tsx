import { useTranslation } from "react-i18next";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { DowntimeReasonBreakdown } from "@shared/types";
import { BarChart3 } from "lucide-react";

interface DowntimeChartProps {
  data: DowntimeReasonBreakdown[];
}

const COLORS = [
  "#f43f5e", // rose-500
  "#fb923c", // orange-400
  "#eab308", // yellow-500
  "#38bdf8", // sky-400
  "#a855f7", // purple-500
  "#ec4899", // pink-500
  "#94a3b8", // slate-400
];

export function DowntimeChart({ data }: DowntimeChartProps) {
  const { t } = useTranslation();

  const formattedData = data.map((item, index) => ({
    ...item,
    displayName: t(`downtime.reasons.${item.reason}`, {
      defaultValue: item.reason,
    }),
    color: COLORS[index % COLORS.length],
  }));

  if (formattedData.length === 0) {
    return (
      <Card className="h-full flex flex-col justify-center items-center p-8 text-center border-border">
        <BarChart3 className="w-12 h-12 text-muted-foreground/40 mb-2" />
        <p className="text-sm text-muted-foreground">
          Nenhum evento de parada computado no período.
        </p>
      </Card>
    );
  }

  return (
    <Card className="border-border shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" />
            {t("dashboard.topReasons")}
          </CardTitle>
          <span className="text-xs text-muted-foreground">Minutos Parados</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={formattedData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
            >
              <XAxis type="number" stroke="#64748b" fontSize={11} />
              <YAxis
                type="category"
                dataKey="displayName"
                stroke="#94a3b8"
                fontSize={11}
                width={130}
                tickFormatter={(val) =>
                  val.length > 18 ? `${val.substring(0, 18)}...` : val
                }
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload as typeof formattedData[0];
                    return (
                      <div className="bg-popover border border-border p-2.5 rounded-lg shadow-lg text-xs space-y-1">
                        <p className="font-bold text-foreground">
                          {item.displayName}
                        </p>
                        <p className="text-primary font-mono">
                          Duração: {item.durationMinutes} minutos ({item.percentage}%)
                        </p>
                        <p className="text-muted-foreground">
                          Ocorrências: {item.count} vezes
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="durationMinutes" radius={[0, 4, 4, 0]}>
                {formattedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
