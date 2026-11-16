import { pgTable, text, varchar, timestamp, integer, boolean, date, real, index, uniqueIndex } from "drizzle-orm/pg-core";
import { z } from "zod";
import { userRoleEnum, machineStatusEnum, shiftEnum, downtimeReasonEnum } from "./enums";

// ── Users ──────────────────────────────────────────────────────────
export const users = pgTable(
  "users",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    username: varchar("username", { length: 50 }).notNull(),
    passwordHash: text("password_hash").notNull(),
    displayName: varchar("display_name", { length: 100 }).notNull(),
    role: userRoleEnum("role").notNull().default("operator"),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("users_username_idx").on(table.username),
  ]
);

// ── Machines ───────────────────────────────────────────────────────
export const machines = pgTable(
  "machines",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    name: varchar("name", { length: 100 }).notNull(),
    code: varchar("code", { length: 20 }).notNull(),
    description: text("description").default(""),
    status: machineStatusEnum("status").notNull().default("stopped"),
    idealCycleTimeSec: integer("ideal_cycle_time_sec").notNull().default(60),
    plannedProductionPerShift: integer("planned_production_per_shift").notNull().default(480),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("machines_code_idx").on(table.code),
    index("machines_active_idx").on(table.active),
  ]
);

// ── Downtime Events ────────────────────────────────────────────────
export const downtimeEvents = pgTable(
  "downtime_events",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    machineId: integer("machine_id").notNull().references(() => machines.id),
    userId: integer("user_id").notNull().references(() => users.id),
    reason: downtimeReasonEnum("reason").notNull(),
    notes: text("notes").default(""),
    startTime: timestamp("start_time").notNull().defaultNow(),
    endTime: timestamp("end_time"),
    durationMinutes: integer("duration_minutes"),
  },
  (table) => [
    index("downtime_machine_idx").on(table.machineId),
    index("downtime_start_idx").on(table.startTime),
    index("downtime_end_idx").on(table.endTime),
  ]
);

// ── Production Records ─────────────────────────────────────────────
export const productionRecords = pgTable(
  "production_records",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    machineId: integer("machine_id").notNull().references(() => machines.id),
    userId: integer("user_id").notNull().references(() => users.id),
    shiftDate: date("shift_date").notNull(),
    shift: shiftEnum("shift").notNull().default("morning"),
    plannedQuantity: integer("planned_quantity").notNull(),
    producedQuantity: integer("produced_quantity").notNull(),
    goodQuantity: integer("good_quantity").notNull(),
    defectiveQuantity: integer("defective_quantity").notNull(),
    plannedTimeMinutes: integer("planned_time_minutes").notNull().default(480),
    actualRunTimeMinutes: integer("actual_run_time_minutes").notNull().default(480),
    availability: real("availability").notNull().default(1),
    performance: real("performance").notNull().default(1),
    quality: real("quality").notNull().default(1),
    oee: real("oee").notNull().default(1),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("production_machine_idx").on(table.machineId),
    index("production_date_idx").on(table.shiftDate),
    index("production_machine_date_idx").on(table.machineId, table.shiftDate),
  ]
);

// ── Explicit Zod Schemas ───────────────────────────────────────────
export const insertUserSchema = z.object({
  username: z.string().min(3, "Usuário deve ter pelo menos 3 caracteres").max(50),
  password: z.string().min(4, "Senha deve ter pelo menos 4 caracteres"),
  displayName: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(100),
  role: z.enum(["operator", "manager", "admin"]).default("operator"),
  active: z.boolean().default(true),
});

export const insertMachineSchema = z.object({
  name: z.string().min(2, "Nome da máquina deve ter pelo menos 2 caracteres").max(100),
  code: z.string().min(2, "Código deve ter pelo menos 2 caracteres").max(20),
  description: z.string().optional().default(""),
  status: z.enum(["running", "stopped", "maintenance"]).default("stopped"),
  idealCycleTimeSec: z.number().int().positive("Tempo de ciclo ideal deve ser positivo").default(60),
  plannedProductionPerShift: z.number().int().positive("Produção planejada deve ser positiva").default(480),
  active: z.boolean().default(true),
});

export const insertDowntimeSchema = z.object({
  machineId: z.number().int().positive("Selecione uma máquina"),
  userId: z.number().int().positive().optional(),
  reason: z.enum([
    "mechanical_failure",
    "electrical_failure",
    "material_shortage",
    "tool_changeover",
    "planned_maintenance",
    "quality_issue",
    "operator_absence",
    "other",
  ]),
  notes: z.string().optional().default(""),
});

export const endDowntimeSchema = z.object({
  notes: z.string().optional(),
});

export const insertProductionSchema = z.object({
  machineId: z.number().int().positive("Selecione uma máquina"),
  userId: z.number().int().positive().optional(),
  shiftDate: z.string().min(10, "Data inválida"),
  shift: z.enum(["morning", "afternoon", "night"]).default("morning"),
  plannedQuantity: z.number().int().nonnegative("Quantidade planejada não pode ser negativa"),
  producedQuantity: z.number().int().nonnegative("Quantidade produzida não pode ser negativa"),
  goodQuantity: z.number().int().nonnegative("Quantidade de peças boas não pode ser negativa"),
  defectiveQuantity: z.number().int().nonnegative("Quantidade de defeituosas não pode ser negativa"),
  plannedTimeMinutes: z.number().int().positive().default(480),
  actualRunTimeMinutes: z.number().int().positive().default(480),
});

export const loginSchema = z.object({
  username: z.string().min(1, "Informe o usuário"),
  password: z.string().min(1, "Informe a senha"),
});

// ── Types ──────────────────────────────────────────────────────────
export type User = typeof users.$inferSelect;
export type SafeUser = Omit<User, "passwordHash">;
export type Machine = typeof machines.$inferSelect;
export type DowntimeEvent = typeof downtimeEvents.$inferSelect;
export type ProductionRecord = typeof productionRecords.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertMachine = z.infer<typeof insertMachineSchema>;
export type InsertDowntime = z.infer<typeof insertDowntimeSchema>;
export type InsertProduction = z.infer<typeof insertProductionSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
