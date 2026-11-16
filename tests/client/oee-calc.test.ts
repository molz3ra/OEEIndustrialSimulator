import { describe, it, expect } from "vitest";
import { calculateOEE, formatPercent, getOEEBenchmarkLabel } from "../../shared/oee";

describe("Cálculo OEE Industrial", () => {
  it("deve calcular Disponibilidade, Performance e Qualidade com exatidão", () => {
    // Cenário:
    // Turno: 480 min planejados
    // Paradas: 60 min -> Tempo real de operação = 420 min
    // Ciclo ideal: 60 seg (1 peça/minuto)
    // Produção esperada no tempo real: 420 peças
    // Produção real: 378 peças (90% performance)
    // Peças boas: 359 peças, defeituosas: 19 (95% qualidade)
    // Disponibilidade = 420 / 480 = 0.875 (87.5%)
    // Performance = 378 / 420 = 0.900 (90%)
    // Qualidade = 359 / 378 = 0.9497 (~95%)
    // OEE = 0.875 * 0.90 * 0.9497 = 0.7479 (~74.8%)

    const result = calculateOEE({
      plannedTimeMinutes: 480,
      actualRunTimeMinutes: 420,
      idealCycleTimeSec: 60,
      producedQuantity: 378,
      goodQuantity: 359,
    });

    expect(result.availability).toBeCloseTo(0.875, 3);
    expect(result.performance).toBeCloseTo(0.9, 3);
    expect(result.quality).toBeCloseTo(0.95, 2);
    expect(result.oee).toBeCloseTo(0.748, 2);
  });

  it("deve lidar com valores zerados sem divisão por zero", () => {
    const result = calculateOEE({
      plannedTimeMinutes: 0,
      actualRunTimeMinutes: 0,
      idealCycleTimeSec: 60,
      producedQuantity: 0,
      goodQuantity: 0,
    });

    expect(result.availability).toBe(0);
    expect(result.performance).toBe(0);
    expect(result.quality).toBe(0);
    expect(result.oee).toBe(0);
  });

  it("deve formatar percentuais corretamente", () => {
    expect(formatPercent(0.854)).toBe("85.4%");
    expect(formatPercent(1)).toBe("100.0%");
    expect(formatPercent(0)).toBe("0.0%");
  });

  it("deve atribuir benchmark correto", () => {
    expect(getOEEBenchmarkLabel(0.88).labelEn).toBe("World Class");
    expect(getOEEBenchmarkLabel(0.72).labelEn).toBe("Good / Typical");
    expect(getOEEBenchmarkLabel(0.55).labelEn).toBe("Below Average");
    expect(getOEEBenchmarkLabel(0.35).labelEn).toBe("Critical / Low");
  });
});
