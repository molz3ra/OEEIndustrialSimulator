import { pgEnum } from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", [
  "operator",
  "manager",
  "admin",
]);

export const machineStatusEnum = pgEnum("machine_status", [
  "running",
  "stopped",
  "maintenance",
]);

export const shiftEnum = pgEnum("shift", [
  "morning",
  "afternoon",
  "night",
]);

export const downtimeReasonEnum = pgEnum("downtime_reason", [
  "mechanical_failure",
  "electrical_failure",
  "material_shortage",
  "tool_changeover",
  "planned_maintenance",
  "quality_issue",
  "operator_absence",
  "other",
]);
