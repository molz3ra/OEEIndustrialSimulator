import { downtimeEvents, type DowntimeEvent, type InsertDowntimeEvent } from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, isNull } from "drizzle-orm";

export interface IStorage {
  createDowntimeEvent(event: InsertDowntimeEvent): Promise<DowntimeEvent>;
  endDowntimeEvent(id: number): Promise<DowntimeEvent>;
  getDowntimeEvent(id: number): Promise<DowntimeEvent | undefined>;
  getAllDowntimeEvents(): Promise<DowntimeEvent[]>;
  getActiveDowntimeEvent(): Promise<DowntimeEvent | undefined>;
  getDowntimeStatistics(): Promise<{
    totalDuration: number;
    eventCount: number;
    avgDuration: number;
    activeCount: number;
  }>;
  getDowntimeByReason(): Promise<Array<{
    reason: string;
    duration: number;
    count: number;
  }>>;
}

export class DatabaseStorage implements IStorage {
  async createDowntimeEvent(insertEvent: InsertDowntimeEvent): Promise<DowntimeEvent> {
    const activeEvent = await this.getActiveDowntimeEvent();
    if (activeEvent) {
      throw new Error("Cannot start new downtime while another is active");
    }

    const [event] = await db
      .insert(downtimeEvents)
      .values(insertEvent)
      .returning();
    return event;
  }

  async endDowntimeEvent(id: number): Promise<DowntimeEvent> {
    const [event] = await db
      .select()
      .from(downtimeEvents)
      .where(eq(downtimeEvents.id, id));
    
    if (!event) {
      throw new Error("Event not found");
    }

    if (event.endTime !== null) {
      throw new Error("Event already ended");
    }

    const endTime = new Date();
    const duration = Math.floor((endTime.getTime() - event.startTime.getTime()) / 1000 / 60);

    const [updatedEvent] = await db
      .update(downtimeEvents)
      .set({ endTime, duration })
      .where(eq(downtimeEvents.id, id))
      .returning();

    return updatedEvent;
  }

  async getDowntimeEvent(id: number): Promise<DowntimeEvent | undefined> {
    const [event] = await db
      .select()
      .from(downtimeEvents)
      .where(eq(downtimeEvents.id, id));
    return event || undefined;
  }

  async getAllDowntimeEvents(): Promise<DowntimeEvent[]> {
    return db
      .select()
      .from(downtimeEvents)
      .orderBy(desc(downtimeEvents.startTime));
  }

  async getActiveDowntimeEvent(): Promise<DowntimeEvent | undefined> {
    const [event] = await db
      .select()
      .from(downtimeEvents)
      .where(isNull(downtimeEvents.endTime))
      .orderBy(desc(downtimeEvents.startTime))
      .limit(1);
    return event || undefined;
  }

  async getDowntimeStatistics(): Promise<{
    totalDuration: number;
    eventCount: number;
    avgDuration: number;
    activeCount: number;
  }> {
    const [stats] = await db
      .select({
        totalDuration: sql<number>`COALESCE(SUM(${downtimeEvents.duration}), 0)`,
        eventCount: sql<number>`COUNT(*)`,
        avgDuration: sql<number>`COALESCE(AVG(${downtimeEvents.duration}), 0)`,
        activeCount: sql<number>`COUNT(*) FILTER (WHERE ${downtimeEvents.endTime} IS NULL)`,
      })
      .from(downtimeEvents);

    return {
      totalDuration: Number(stats.totalDuration),
      eventCount: Number(stats.eventCount),
      avgDuration: Math.round(Number(stats.avgDuration)),
      activeCount: Number(stats.activeCount),
    };
  }

  async getDowntimeByReason(): Promise<Array<{
    reason: string;
    duration: number;
    count: number;
  }>> {
    const results = await db
      .select({
        reason: downtimeEvents.reason,
        duration: sql<number>`COALESCE(SUM(${downtimeEvents.duration}), 0)`,
        count: sql<number>`COUNT(*)`,
      })
      .from(downtimeEvents)
      .where(sql`${downtimeEvents.duration} IS NOT NULL`)
      .groupBy(downtimeEvents.reason)
      .orderBy(desc(sql`COALESCE(SUM(${downtimeEvents.duration}), 0)`));

    return results.map(r => ({
      reason: r.reason,
      duration: Number(r.duration),
      count: Number(r.count),
    }));
  }
}

export const storage = new DatabaseStorage();
