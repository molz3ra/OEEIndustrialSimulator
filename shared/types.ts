import type { DowntimeEvent, Machine, ProductionRecord, SafeUser } from "./schema";

export interface OEECalculationInput {
  plannedTimeMinutes: number;
  actualRunTimeMinutes: number;
  idealCycleTimeSec: number;
  producedQuantity: number;
  goodQuantity: number;
}

export interface OEEResult {
  availability: number; // 0 to 1
  performance: number;  // 0 to 1
  quality: number;      // 0 to 1
  oee: number;          // 0 to 1
}

export interface MachineOEESummary {
  machine: Machine;
  activeDowntime?: DowntimeEvent | null;
  todayProduction?: ProductionRecord | null;
  currentOEE: OEEResult;
  recentDowntimeMinutes: number;
  downtimeEventCount: number;
}

export interface DowntimeStatistics {
  totalDurationMinutes: number;
  eventCount: number;
  avgDurationMinutes: number;
  activeCount: number;
}

export interface DowntimeReasonBreakdown {
  reason: string;
  durationMinutes: number;
  count: number;
  percentage: number;
}

export interface OEETrendPoint {
  date: string;
  shift: string;
  availability: number;
  performance: number;
  quality: number;
  oee: number;
  producedQuantity: number;
  goodQuantity: number;
  defectiveQuantity: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
