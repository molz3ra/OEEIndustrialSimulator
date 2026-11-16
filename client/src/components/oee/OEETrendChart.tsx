import { useTranslation } from "react-i18next";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { OEETrendPoint } from "@shared/types";
import { TrendingUp } from "lucide-react";

interface OEETrendChartProps {
  data: OEETrendPoint[];
}

export function OEETrendChart({ data }: OEETrendChartProps) {
  const { t } = useTranslation();

  const formattedData = data.map((d) => ({
    label: `${d.date.slice(5)} (${d.shift.slice(0, 1).toUpperCase()})`,
    oee: Math.round(d.oee * 100),
    availability: Math.round(d.availability * 100),
    performance: Math.round(d.performance * 100),
    quality: Math.round(d.quality * 100),
  }));

  if (formattedData.length === 0) {
    return (
      <Card className="h-full flex flex-col justify-center items-center p-8 text-center border-border">
        <TrendingUp className="w-12 h-12 text-muted-foreground/40 mb-2" />
        <p className="text-sm text-muted-foreground">
          Sem dados históricos de produção registrados.
        </p>
      </Card>
    );
  }

  return (
    <Card className="border-border shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            {t("dashboard.oeeTrend")}
          </CardTitle>
          <span className="text-xs text-muted-foreground font-medium">
            OEE Geral vs 3 Pilares (%)
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={formattedData}
              margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
              <XAxis dataKey="label" stroke="#94a3b8" fontSize={11} />
              <YAxis domain={[0, 100]} stroke="#64748b" fontSize={11} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-popover border border-border p-3 rounded-lg shadow-xl text-xs space-y-1">
                        <p className="font-bold text-foreground mb-1">
                          Turno: {label}
                        </p>
                        {payload.map((p, i) => (
                          <div key={i} className="flex justify-between gap-4 font-mono">
                            <span style={{ color: p.color }}>{p.name}:</span>
                            <span className="font-bold">{p.value}%</span>
                          </div>
                        ))}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
              <Line
                type="monotone"
                dataKey="oee"
                name="OEE Geral"
                stroke="#38bdf8"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="availability"
                name="Disponibilidade"
                stroke="#10b981"
                strokeWidth={1.5}
                strokeDasharray="4 4"
              />
              <Line
                type="monotone"
                dataKey="performance"
                name="Performance"
                stroke="#f59e0b"
                strokeWidth={1.5}
                strokeDasharray="4 4"
              />
              <Line
                type="monotone"
                dataKey="quality"
                name="Qualidade"
                stroke="#a855f7"
                strokeWidth={1.5}
                strokeDasharray="4 4"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
