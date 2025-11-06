import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const downtimeEvents = pgTable("downtime_events", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  reason: text("reason").notNull(),
  notes: text("notes").default(""),
  startTime: timestamp("start_time").notNull().defaultNow(),
  endTime: timestamp("end_time"),
  duration: integer("duration"),
});

export const insertDowntimeEventSchema = createInsertSchema(downtimeEvents).omit({
  id: true,
  startTime: true,
  duration: true,
});

export type InsertDowntimeEvent = z.infer<typeof insertDowntimeEventSchema>;
export type DowntimeEvent = typeof downtimeEvents.$inferSelect;
