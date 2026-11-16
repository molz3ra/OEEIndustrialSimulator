import type { OEECalculationInput, OEEResult } from "./types";

/**
 * Calcula o OEE completo a partir dos 3 pilares industriais:
 * OEE = Disponibilidade × Performance × Qualidade
 */
export function calculateOEE(input: OEECalculationInput): OEEResult {
  const {
    plannedTimeMinutes,
    actualRunTimeMinutes,
    idealCycleTimeSec,
    producedQuantity,
    goodQuantity,
  } = input;

  if (plannedTimeMinutes <= 0 || producedQuantity <= 0) {
    return { availability: 0, performance: 0, quality: 0, oee: 0 };
  }

  // 1. Disponibilidade = Tempo Real de Operação / Tempo Planejado
  const availability = Math.min(
    Math.max(actualRunTimeMinutes / plannedTimeMinutes, 0),
    1
  );

  // 2. Performance = (Peças Produzidas × Tempo Ciclo Ideal em seg) / (Tempo Real em seg)
  const actualRunTimeSec = Math.max(actualRunTimeMinutes * 60, 1);
  const idealOutputInRunTime = actualRunTimeSec / Math.max(idealCycleTimeSec, 1);
  const performance = Math.min(
    Math.max(producedQuantity / Math.max(idealOutputInRunTime, 1), 0),
    1
  );

  // 3. Qualidade = Peças Boas / Peças Produzidas
  const quality = Math.min(
    Math.max(goodQuantity / Math.max(producedQuantity, 1), 0),
    1
  );

  // OEE Geral
  const oee = availability * performance * quality;

  return {
    availability: Number(availability.toFixed(4)),
    performance: Number(performance.toFixed(4)),
    quality: Number(quality.toFixed(4)),
    oee: Number(oee.toFixed(4)),
  };
}

export function formatPercent(value: number): string {
  return `${(Math.max(0, value) * 100).toFixed(1)}%`;
}

export function getOEEBenchmarkLabel(oee: number): {
  labelPt: string;
  labelEn: string;
  color: string;
  bgColor: string;
} {
  if (oee >= 0.85) {
    return {
      labelPt: "Classe Mundial (World Class)",
      labelEn: "World Class",
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
    };
  }
  if (oee >= 0.7) {
    return {
      labelPt: "Bom / Típico",
      labelEn: "Good / Typical",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    };
  }
  if (oee >= 0.5) {
    return {
      labelPt: "Abaixo da Média",
      labelEn: "Below Average",
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    };
  }
  return {
    labelPt: "Crítico / Atenção",
    labelEn: "Critical / Low",
    color: "text-red-500",
    bgColor: "bg-red-500/10",
  };
}
