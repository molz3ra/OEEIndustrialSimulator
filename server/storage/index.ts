import bcrypt from "bcryptjs";
import {
  type User,
  type Machine,
  type DowntimeEvent,
  type ProductionRecord,
  type InsertUser,
  type InsertMachine,
  type InsertDowntime,
  type InsertProduction,
  users,
  machines,
  downtimeEvents,
  productionRecords,
} from "@shared/schema";
import type {
  DowntimeReasonBreakdown,
  DowntimeStatistics,
  MachineOEESummary,
  OEETrendPoint,
  PaginatedResult,
} from "@shared/types";
import { calculateOEE } from "@shared/oee";
import { db, isDbConfigured } from "../db";
import { eq, desc, sql, and, isNull } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser & { passwordHash: string }): Promise<User>;
  getAllUsers(): Promise<User[]>;

  // Machines
  getMachine(id: number): Promise<Machine | undefined>;
  getMachineByCode(code: string): Promise<Machine | undefined>;
  getAllMachines(): Promise<Machine[]>;
  createMachine(machine: InsertMachine): Promise<Machine>;
  updateMachine(id: number, data: Partial<InsertMachine>): Promise<Machine>;

  // Downtimes
  createDowntime(event: InsertDowntime): Promise<DowntimeEvent>;
  endDowntime(id: number, notes?: string): Promise<DowntimeEvent>;
  getActiveDowntime(machineId: number): Promise<DowntimeEvent | undefined>;
  getAllDowntimes(options?: {
    machineId?: number;
    limit?: number;
    page?: number;
  }): Promise<PaginatedResult<DowntimeEvent>>;
  getDowntimeStatistics(machineId?: number): Promise<DowntimeStatistics>;
  getDowntimeByReason(machineId?: number): Promise<DowntimeReasonBreakdown[]>;

  // Production & OEE
  createProductionRecord(record: InsertProduction): Promise<ProductionRecord>;
  getProductionRecords(options?: {
    machineId?: number;
    limit?: number;
    page?: number;
  }): Promise<PaginatedResult<ProductionRecord>>;
  getMachineOEESummary(machineId: number): Promise<MachineOEESummary>;
  getOEETrend(machineId: number, days?: number): Promise<OEETrendPoint[]>;
  getGlobalOEEOverview(): Promise<MachineOEESummary[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private machines: Map<number, Machine> = new Map();
  private downtimes: Map<number, DowntimeEvent> = new Map();
  private productions: Map<number, ProductionRecord> = new Map();

  private userIdSeq = 1;
  private machineIdSeq = 1;
  private downtimeIdSeq = 1;
  private productionIdSeq = 1;

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData() {
    const salt = bcrypt.genSaltSync(10);
    const adminHash = bcrypt.hashSync("admin123", salt);
    const managerHash = bcrypt.hashSync("gerente123", salt);
    const operatorHash = bcrypt.hashSync("operador123", salt);

    // Initial users
    this.users.set(1, {
      id: 1,
      username: "admin",
      passwordHash: adminHash,
      displayName: "Administrador do Sistema",
      role: "admin",
      active: true,
      createdAt: new Date(),
    });
    this.users.set(2, {
      id: 2,
      username: "gerente",
      passwordHash: managerHash,
      displayName: "Carlos Gerente",
      role: "manager",
      active: true,
      createdAt: new Date(),
    });
    this.users.set(3, {
      id: 3,
      username: "operador",
      passwordHash: operatorHash,
      displayName: "Lucas Operador",
      role: "operator",
      active: true,
      createdAt: new Date(),
    });
    this.userIdSeq = 4;

    // Initial machines
    this.machines.set(1, {
      id: 1,
      name: "Torno CNC Haas ST-20",
      code: "CNC-01",
      description: "Torno CNC de alta precisão para usinagem pesada",
      status: "running",
      idealCycleTimeSec: 45,
      plannedProductionPerShift: 450,
      active: true,
      createdAt: new Date(),
    });
    this.machines.set(2, {
      id: 2,
      name: "Centro de Usinagem Romi D800",
      code: "CNC-02",
      description: "Centro vertical 3 eixos para moldes e ferramentas",
      status: "stopped",
      idealCycleTimeSec: 60,
      plannedProductionPerShift: 400,
      active: true,
      createdAt: new Date(),
    });
    this.machines.set(3, {
      id: 3,
      name: "Prensa Hidráulica 200T",
      code: "PRS-03",
      description: "Prensa de conformação a frio",
      status: "running",
      idealCycleTimeSec: 30,
      plannedProductionPerShift: 700,
      active: true,
      createdAt: new Date(),
    });
    this.machineIdSeq = 4;

    // Historical Downtimes
    const now = new Date();
    const past1 = new Date(now.getTime() - 4 * 60 * 60 * 1000);
    const past1End = new Date(past1.getTime() + 35 * 60 * 1000);
    this.downtimes.set(1, {
      id: 1,
      machineId: 1,
      userId: 3,
      reason: "tool_changeover",
      notes: "Troca de pastilhas de corte e zeramento",
      startTime: past1,
      endTime: past1End,
      durationMinutes: 35,
    });

    const past2 = new Date(now.getTime() - 2 * 60 * 60 * 1000);
    const past2End = new Date(past2.getTime() + 50 * 60 * 1000);
    this.downtimes.set(2, {
      id: 2,
      machineId: 2,
      userId: 3,
      reason: "mechanical_failure",
      notes: "Superaquecimento do fuso principal",
      startTime: past2,
      endTime: past2End,
      durationMinutes: 50,
    });

    // Active downtime on machine 2
    const activeStart = new Date(now.getTime() - 15 * 60 * 1000);
    this.downtimes.set(3, {
      id: 3,
      machineId: 2,
      userId: 3,
      reason: "material_shortage",
      notes: "Aguardando lote de tarugos de aço 1045",
      startTime: activeStart,
      endTime: null,
      durationMinutes: null,
    });
    this.downtimeIdSeq = 4;

    // Production records (last 5 days)
    const shifts: Array<"morning" | "afternoon" | "night"> = ["morning", "afternoon"];
    let prodId = 1;
    for (let dayOffset = 4; dayOffset >= 0; dayOffset--) {
      const d = new Date(now.getTime() - dayOffset * 24 * 60 * 60 * 1000);
      const dateStr = d.toISOString().split("T")[0];

      for (const mId of [1, 2, 3]) {
        for (const shift of shifts) {
          const mach = this.machines.get(mId)!;
          const plannedQty = mach.plannedProductionPerShift;
          const plannedTime = 480; // 8h em minutos
          const runTime = 420 + Math.floor(Math.random() * 45);
          const producedQty = Math.floor((runTime * 60) / mach.idealCycleTimeSec * (0.85 + Math.random() * 0.12));
          const defectiveQty = Math.floor(producedQty * (0.01 + Math.random() * 0.04));
          const goodQty = producedQty - defectiveQty;

          const oeeMetrics = calculateOEE({
            plannedTimeMinutes: plannedTime,
            actualRunTimeMinutes: runTime,
            idealCycleTimeSec: mach.idealCycleTimeSec,
            producedQuantity: producedQty,
            goodQuantity: goodQty,
          });

          this.productions.set(prodId, {
            id: prodId,
            machineId: mId,
            userId: 3,
            shiftDate: dateStr,
            shift,
            plannedQuantity: plannedQty,
            producedQuantity: producedQty,
            goodQuantity: goodQty,
            defectiveQuantity: defectiveQty,
            plannedTimeMinutes: plannedTime,
            actualRunTimeMinutes: runTime,
            availability: oeeMetrics.availability,
            performance: oeeMetrics.performance,
            quality: oeeMetrics.quality,
            oee: oeeMetrics.oee,
            createdAt: d,
          });
          prodId++;
        }
      }
    }
    this.productionIdSeq = prodId;
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    for (const u of this.users.values()) {
      if (u.username.toLowerCase() === username.toLowerCase()) {
        return u;
      }
    }
    return undefined;
  }

  async createUser(user: InsertUser & { passwordHash: string }): Promise<User> {
    const existing = await this.getUserByUsername(user.username);
    if (existing) {
      throw new Error("Nome de usuário já existe");
    }
    const id = this.userIdSeq++;
    const newUser: User = {
      id,
      username: user.username,
      passwordHash: user.passwordHash,
      displayName: user.displayName,
      role: user.role ?? "operator",
      active: user.active ?? true,
      createdAt: new Date(),
    };
    this.users.set(id, newUser);
    return newUser;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Machines
  async getMachine(id: number): Promise<Machine | undefined> {
    return this.machines.get(id);
  }

  async getMachineByCode(code: string): Promise<Machine | undefined> {
    for (const m of this.machines.values()) {
      if (m.code.toUpperCase() === code.toUpperCase()) {
        return m;
      }
    }
    return undefined;
  }

  async getAllMachines(): Promise<Machine[]> {
    return Array.from(this.machines.values());
  }

  async createMachine(insert: InsertMachine): Promise<Machine> {
    const existing = await this.getMachineByCode(insert.code);
    if (existing) {
      throw new Error(`Máquina com código ${insert.code} já existe`);
    }
    const id = this.machineIdSeq++;
    const newMachine: Machine = {
      id,
      name: insert.name,
      code: insert.code,
      description: insert.description ?? "",
      status: insert.status ?? "stopped",
      idealCycleTimeSec: insert.idealCycleTimeSec ?? 60,
      plannedProductionPerShift: insert.plannedProductionPerShift ?? 480,
      active: insert.active ?? true,
      createdAt: new Date(),
    };
    this.machines.set(id, newMachine);
    return newMachine;
  }

  async updateMachine(id: number, data: Partial<InsertMachine>): Promise<Machine> {
    const machine = this.machines.get(id);
    if (!machine) {
      throw new Error("Máquina não encontrada");
    }
    const updated: Machine = {
      ...machine,
      ...data,
    };
    this.machines.set(id, updated);
    return updated;
  }

  // Downtimes
  async createDowntime(event: InsertDowntime): Promise<DowntimeEvent> {
    const active = await this.getActiveDowntime(event.machineId);
    if (active) {
      throw new Error("Esta máquina já possui uma parada ativa em andamento");
    }
    const id = this.downtimeIdSeq++;
    const newEvent: DowntimeEvent = {
      id,
      machineId: event.machineId,
      userId: event.userId || 1,
      reason: event.reason,
      notes: event.notes ?? "",
      startTime: new Date(),
      endTime: null,
      durationMinutes: null,
    };
    this.downtimes.set(id, newEvent);

    // Update machine status
    const machine = this.machines.get(event.machineId);
    if (machine) {
      machine.status = "stopped";
    }

    return newEvent;
  }

  async endDowntime(id: number, notes?: string): Promise<DowntimeEvent> {
    const event = this.downtimes.get(id);
    if (!event) {
      throw new Error("Evento de parada não encontrado");
    }
    if (event.endTime !== null) {
      throw new Error("Este evento de parada já foi finalizado");
    }

    const endTime = new Date();
    const durationMinutes = Math.max(
      1,
      Math.round((endTime.getTime() - event.startTime.getTime()) / (1000 * 60))
    );

    event.endTime = endTime;
    event.durationMinutes = durationMinutes;
    if (notes) {
      event.notes = event.notes ? `${event.notes} | ${notes}` : notes;
    }

    // Update machine status to running
    const machine = this.machines.get(event.machineId);
    if (machine) {
      machine.status = "running";
    }

    return event;
  }

  async getActiveDowntime(machineId: number): Promise<DowntimeEvent | undefined> {
    for (const d of this.downtimes.values()) {
      if (d.machineId === machineId && d.endTime === null) {
        return d;
      }
    }
    return undefined;
  }

  async getAllDowntimes(options?: {
    machineId?: number;
    limit?: number;
    page?: number;
  }): Promise<PaginatedResult<DowntimeEvent>> {
    let items = Array.from(this.downtimes.values()).sort(
      (a, b) => b.startTime.getTime() - a.startTime.getTime()
    );

    if (options?.machineId) {
      items = items.filter((d) => d.machineId === options.machineId);
    }

    const total = items.length;
    const page = Math.max(1, options?.page ?? 1);
    const limit = Math.max(1, options?.limit ?? 15);
    const totalPages = Math.ceil(total / limit) || 1;
    const offset = (page - 1) * limit;
    const data = items.slice(offset, offset + limit);

    return { data, total, page, limit, totalPages };
  }

  async getDowntimeStatistics(machineId?: number): Promise<DowntimeStatistics> {
    let items = Array.from(this.downtimes.values());
    if (machineId) {
      items = items.filter((d) => d.machineId === machineId);
    }

    let totalDurationMinutes = 0;
    let finishedCount = 0;
    let activeCount = 0;

    for (const item of items) {
      if (item.endTime === null) {
        activeCount++;
      } else if (item.durationMinutes) {
        totalDurationMinutes += item.durationMinutes;
        finishedCount++;
      }
    }

    const avgDurationMinutes =
      finishedCount > 0 ? Math.round(totalDurationMinutes / finishedCount) : 0;

    return {
      totalDurationMinutes,
      eventCount: items.length,
      avgDurationMinutes,
      activeCount,
    };
  }

  async getDowntimeByReason(machineId?: number): Promise<DowntimeReasonBreakdown[]> {
    let items = Array.from(this.downtimes.values()).filter(
      (d) => d.durationMinutes !== null && d.durationMinutes > 0
    );
    if (machineId) {
      items = items.filter((d) => d.machineId === machineId);
    }

    const grouped = new Map<string, { duration: number; count: number }>();
    let totalDuration = 0;

    for (const item of items) {
      const current = grouped.get(item.reason) || { duration: 0, count: 0 };
      const dur = item.durationMinutes || 0;
      current.duration += dur;
      current.count += 1;
      totalDuration += dur;
      grouped.set(item.reason, current);
    }

    const result: DowntimeReasonBreakdown[] = [];
    for (const [reason, val] of grouped.entries()) {
      result.push({
        reason,
        durationMinutes: val.duration,
        count: val.count,
        percentage:
          totalDuration > 0
            ? Number(((val.duration / totalDuration) * 100).toFixed(1))
            : 0,
      });
    }

    return result.sort((a, b) => b.durationMinutes - a.durationMinutes);
  }

  // Production
  async createProductionRecord(record: InsertProduction): Promise<ProductionRecord> {
    const machine = this.machines.get(record.machineId);
    if (!machine) {
      throw new Error("Máquina não encontrada");
    }

    const oeeMetrics = calculateOEE({
      plannedTimeMinutes: record.plannedTimeMinutes ?? 480,
      actualRunTimeMinutes: record.actualRunTimeMinutes ?? 480,
      idealCycleTimeSec: machine.idealCycleTimeSec,
      producedQuantity: record.producedQuantity,
      goodQuantity: record.goodQuantity,
    });

    const id = this.productionIdSeq++;
    const newRecord: ProductionRecord = {
      id,
      machineId: record.machineId,
      userId: record.userId || 1,
      shiftDate: record.shiftDate,
      shift: record.shift ?? "morning",
      plannedQuantity: record.plannedQuantity,
      producedQuantity: record.producedQuantity,
      goodQuantity: record.goodQuantity,
      defectiveQuantity: record.defectiveQuantity,
      plannedTimeMinutes: record.plannedTimeMinutes ?? 480,
      actualRunTimeMinutes: record.actualRunTimeMinutes ?? 480,
      availability: oeeMetrics.availability,
      performance: oeeMetrics.performance,
      quality: oeeMetrics.quality,
      oee: oeeMetrics.oee,
      createdAt: new Date(),
    };

    this.productions.set(id, newRecord);
    return newRecord;
  }

  async getProductionRecords(options?: {
    machineId?: number;
    limit?: number;
    page?: number;
  }): Promise<PaginatedResult<ProductionRecord>> {
    let items = Array.from(this.productions.values()).sort(
      (a, b) => new Date(b.shiftDate).getTime() - new Date(a.shiftDate).getTime()
    );

    if (options?.machineId) {
      items = items.filter((p) => p.machineId === options.machineId);
    }

    const total = items.length;
    const page = Math.max(1, options?.page ?? 1);
    const limit = Math.max(1, options?.limit ?? 15);
    const totalPages = Math.ceil(total / limit) || 1;
    const offset = (page - 1) * limit;
    const data = items.slice(offset, offset + limit);

    return { data, total, page, limit, totalPages };
  }

  async getMachineOEESummary(machineId: number): Promise<MachineOEESummary> {
    const machine = this.machines.get(machineId);
    if (!machine) {
      throw new Error("Máquina não encontrada");
    }

    const activeDowntime = await this.getActiveDowntime(machineId);

    // Get today or most recent production record
    const machineProductions = Array.from(this.productions.values())
      .filter((p) => p.machineId === machineId)
      .sort((a, b) => new Date(b.shiftDate).getTime() - new Date(a.shiftDate).getTime());

    const latestProd = machineProductions[0] || null;

    // Downtimes in last 24h
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentDowntimes = Array.from(this.downtimes.values()).filter(
      (d) => d.machineId === machineId && d.startTime >= dayAgo
    );

    const recentDowntimeMinutes = recentDowntimes.reduce(
      (acc, d) => acc + (d.durationMinutes || 0),
      0
    );

    const currentOEE = latestProd
      ? {
          availability: latestProd.availability,
          performance: latestProd.performance,
          quality: latestProd.quality,
          oee: latestProd.oee,
        }
      : {
          availability: 1,
          performance: 1,
          quality: 1,
          oee: 1,
        };

    return {
      machine,
      activeDowntime,
      todayProduction: latestProd,
      currentOEE,
      recentDowntimeMinutes,
      downtimeEventCount: recentDowntimes.length,
    };
  }

  async getOEETrend(machineId: number, days: number = 7): Promise<OEETrendPoint[]> {
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const items = Array.from(this.productions.values())
      .filter(
        (p) =>
          p.machineId === machineId && new Date(p.shiftDate) >= cutoff
      )
      .sort(
        (a, b) =>
          new Date(a.shiftDate).getTime() - new Date(b.shiftDate).getTime()
      );

    return items.map((p) => ({
      date: p.shiftDate,
      shift: p.shift,
      availability: p.availability,
      performance: p.performance,
      quality: p.quality,
      oee: p.oee,
      producedQuantity: p.producedQuantity,
      goodQuantity: p.goodQuantity,
      defectiveQuantity: p.defectiveQuantity,
    }));
  }

  async getGlobalOEEOverview(): Promise<MachineOEESummary[]> {
    const list: MachineOEESummary[] = [];
    for (const machine of this.machines.values()) {
      if (machine.active) {
        const summary = await this.getMachineOEESummary(machine.id);
        list.push(summary);
      }
    }
    return list;
  }
}

// Database Storage implementation using Drizzle + Neon
export class DatabaseStorage implements IStorage {
  private fallback: MemStorage = new MemStorage();

  async getUser(id: number): Promise<User | undefined> {
    if (!isDbConfigured) return this.fallback.getUser(id);
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    if (!isDbConfigured) return this.fallback.getUserByUsername(username);
    const [user] = await db
      .select()
      .from(users)
      .where(sql`LOWER(${users.username}) = LOWER(${username})`);
    return user;
  }

  async createUser(user: InsertUser & { passwordHash: string }): Promise<User> {
    if (!isDbConfigured) return this.fallback.createUser(user);
    const [newUser] = await db
      .insert(users)
      .values({
        username: user.username,
        passwordHash: user.passwordHash,
        displayName: user.displayName,
        role: user.role ?? "operator",
        active: user.active ?? true,
      })
      .returning();
    return newUser;
  }

  async getAllUsers(): Promise<User[]> {
    if (!isDbConfigured) return this.fallback.getAllUsers();
    return db.select().from(users).orderBy(users.id);
  }

  async getMachine(id: number): Promise<Machine | undefined> {
    if (!isDbConfigured) return this.fallback.getMachine(id);
    const [machine] = await db.select().from(machines).where(eq(machines.id, id));
    return machine;
  }

  async getMachineByCode(code: string): Promise<Machine | undefined> {
    if (!isDbConfigured) return this.fallback.getMachineByCode(code);
    const [machine] = await db
      .select()
      .from(machines)
      .where(sql`LOWER(${machines.code}) = LOWER(${code})`);
    return machine;
  }

  async getAllMachines(): Promise<Machine[]> {
    if (!isDbConfigured) return this.fallback.getAllMachines();
    return db.select().from(machines).orderBy(machines.id);
  }

  async createMachine(insert: InsertMachine): Promise<Machine> {
    if (!isDbConfigured) return this.fallback.createMachine(insert);
    const [newMachine] = await db.insert(machines).values(insert).returning();
    return newMachine;
  }

  async updateMachine(id: number, data: Partial<InsertMachine>): Promise<Machine> {
    if (!isDbConfigured) return this.fallback.updateMachine(id, data);
    const [updated] = await db
      .update(machines)
      .set(data)
      .where(eq(machines.id, id))
      .returning();
    return updated;
  }

  async createDowntime(event: InsertDowntime): Promise<DowntimeEvent> {
    if (!isDbConfigured) return this.fallback.createDowntime(event);
    const active = await this.getActiveDowntime(event.machineId);
    if (active) {
      throw new Error("Esta máquina já possui uma parada ativa em andamento");
    }

    const [newEvent] = await db
      .insert(downtimeEvents)
      .values({
        machineId: event.machineId,
        userId: event.userId || 1,
        reason: event.reason,
        notes: event.notes ?? "",
      })
      .returning();

    await db
      .update(machines)
      .set({ status: "stopped" })
      .where(eq(machines.id, event.machineId));

    return newEvent;
  }

  async endDowntime(id: number, notes?: string): Promise<DowntimeEvent> {
    if (!isDbConfigured) return this.fallback.endDowntime(id, notes);
    const [event] = await db
      .select()
      .from(downtimeEvents)
      .where(eq(downtimeEvents.id, id));

    if (!event) throw new Error("Evento de parada não encontrado");
    if (event.endTime !== null) throw new Error("Este evento de parada já foi finalizado");

    const endTime = new Date();
    const durationMinutes = Math.max(
      1,
      Math.round((endTime.getTime() - event.startTime.getTime()) / (1000 * 60))
    );

    const updatedNotes = notes
      ? event.notes
        ? `${event.notes} | ${notes}`
        : notes
      : event.notes;

    const [updatedEvent] = await db
      .update(downtimeEvents)
      .set({
        endTime,
        durationMinutes,
        notes: updatedNotes,
      })
      .where(eq(downtimeEvents.id, id))
      .returning();

    await db
      .update(machines)
      .set({ status: "running" })
      .where(eq(machines.id, event.machineId));

    return updatedEvent;
  }

  async getActiveDowntime(machineId: number): Promise<DowntimeEvent | undefined> {
    if (!isDbConfigured) return this.fallback.getActiveDowntime(machineId);
    const [event] = await db
      .select()
      .from(downtimeEvents)
      .where(
        and(
          eq(downtimeEvents.machineId, machineId),
          isNull(downtimeEvents.endTime)
        )
      )
      .orderBy(desc(downtimeEvents.startTime))
      .limit(1);
    return event;
  }

  async getAllDowntimes(options?: {
    machineId?: number;
    limit?: number;
    page?: number;
  }): Promise<PaginatedResult<DowntimeEvent>> {
    if (!isDbConfigured) return this.fallback.getAllDowntimes(options);
    const page = Math.max(1, options?.page ?? 1);
    const limit = Math.max(1, options?.limit ?? 15);
    const offset = (page - 1) * limit;

    let query = db.select().from(downtimeEvents);
    let countQuery = db.select({ count: sql<number>`count(*)` }).from(downtimeEvents);

    if (options?.machineId) {
      query = query.where(eq(downtimeEvents.machineId, options.machineId)) as any;
      countQuery = countQuery.where(eq(downtimeEvents.machineId, options.machineId)) as any;
    }

    const [totalRes] = await countQuery;
    const total = Number(totalRes?.count || 0);
    const totalPages = Math.ceil(total / limit) || 1;

    const data = await query
      .orderBy(desc(downtimeEvents.startTime))
      .limit(limit)
      .offset(offset);

    return { data, total, page, limit, totalPages };
  }

  async getDowntimeStatistics(machineId?: number): Promise<DowntimeStatistics> {
    if (!isDbConfigured) return this.fallback.getDowntimeStatistics(machineId);

    const condition = machineId
      ? eq(downtimeEvents.machineId, machineId)
      : undefined;

    const [stats] = await db
      .select({
        totalDurationMinutes: sql<number>`COALESCE(SUM(${downtimeEvents.durationMinutes}), 0)`,
        eventCount: sql<number>`COUNT(*)`,
        avgDurationMinutes: sql<number>`COALESCE(AVG(${downtimeEvents.durationMinutes}), 0)`,
        activeCount: sql<number>`COUNT(*) FILTER (WHERE ${downtimeEvents.endTime} IS NULL)`,
      })
      .from(downtimeEvents)
      .where(condition);

    return {
      totalDurationMinutes: Number(stats?.totalDurationMinutes || 0),
      eventCount: Number(stats?.eventCount || 0),
      avgDurationMinutes: Math.round(Number(stats?.avgDurationMinutes || 0)),
      activeCount: Number(stats?.activeCount || 0),
    };
  }

  async getDowntimeByReason(machineId?: number): Promise<DowntimeReasonBreakdown[]> {
    if (!isDbConfigured) return this.fallback.getDowntimeByReason(machineId);

    const condition = machineId
      ? and(
          eq(downtimeEvents.machineId, machineId),
          sql`${downtimeEvents.durationMinutes} IS NOT NULL`
        )
      : sql`${downtimeEvents.durationMinutes} IS NOT NULL`;

    const results = await db
      .select({
        reason: downtimeEvents.reason,
        durationMinutes: sql<number>`COALESCE(SUM(${downtimeEvents.durationMinutes}), 0)`,
        count: sql<number>`COUNT(*)`,
      })
      .from(downtimeEvents)
      .where(condition)
      .groupBy(downtimeEvents.reason)
      .orderBy(desc(sql`COALESCE(SUM(${downtimeEvents.durationMinutes}), 0)`));

    const total = results.reduce(
      (acc, r) => acc + Number(r.durationMinutes || 0),
      0
    );

    return results.map((r) => ({
      reason: r.reason,
      durationMinutes: Number(r.durationMinutes),
      count: Number(r.count),
      percentage:
        total > 0
          ? Number(((Number(r.durationMinutes) / total) * 100).toFixed(1))
          : 0,
    }));
  }

  async createProductionRecord(record: InsertProduction): Promise<ProductionRecord> {
    if (!isDbConfigured) return this.fallback.createProductionRecord(record);
    const machine = await this.getMachine(record.machineId);
    if (!machine) throw new Error("Máquina não encontrada");

    const oeeMetrics = calculateOEE({
      plannedTimeMinutes: record.plannedTimeMinutes ?? 480,
      actualRunTimeMinutes: record.actualRunTimeMinutes ?? 480,
      idealCycleTimeSec: machine.idealCycleTimeSec,
      producedQuantity: record.producedQuantity,
      goodQuantity: record.goodQuantity,
    });

    const [newRecord] = await db
      .insert(productionRecords)
      .values({
        machineId: record.machineId,
        userId: record.userId || 1,
        shiftDate: record.shiftDate,
        shift: record.shift ?? "morning",
        plannedQuantity: record.plannedQuantity,
        producedQuantity: record.producedQuantity,
        goodQuantity: record.goodQuantity,
        defectiveQuantity: record.defectiveQuantity,
        plannedTimeMinutes: record.plannedTimeMinutes ?? 480,
        actualRunTimeMinutes: record.actualRunTimeMinutes ?? 480,
        availability: oeeMetrics.availability,
        performance: oeeMetrics.performance,
        quality: oeeMetrics.quality,
        oee: oeeMetrics.oee,
      })
      .returning();

    return newRecord;
  }

  async getProductionRecords(options?: {
    machineId?: number;
    limit?: number;
    page?: number;
  }): Promise<PaginatedResult<ProductionRecord>> {
    if (!isDbConfigured) return this.fallback.getProductionRecords(options);
    const page = Math.max(1, options?.page ?? 1);
    const limit = Math.max(1, options?.limit ?? 15);
    const offset = (page - 1) * limit;

    let query = db.select().from(productionRecords);
    let countQuery = db
      .select({ count: sql<number>`count(*)` })
      .from(productionRecords);

    if (options?.machineId) {
      query = query.where(eq(productionRecords.machineId, options.machineId)) as any;
      countQuery = countQuery.where(
        eq(productionRecords.machineId, options.machineId)
      ) as any;
    }

    const [totalRes] = await countQuery;
    const total = Number(totalRes?.count || 0);
    const totalPages = Math.ceil(total / limit) || 1;

    const data = await query
      .orderBy(desc(productionRecords.shiftDate), desc(productionRecords.id))
      .limit(limit)
      .offset(offset);

    return { data, total, page, limit, totalPages };
  }

  async getMachineOEESummary(machineId: number): Promise<MachineOEESummary> {
    if (!isDbConfigured) return this.fallback.getMachineOEESummary(machineId);
    const machine = await this.getMachine(machineId);
    if (!machine) throw new Error("Máquina não encontrada");

    const activeDowntime = await this.getActiveDowntime(machineId);

    const [latestProd] = await db
      .select()
      .from(productionRecords)
      .where(eq(productionRecords.machineId, machineId))
      .orderBy(desc(productionRecords.shiftDate), desc(productionRecords.id))
      .limit(1);

    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentDowntimes = await db
      .select()
      .from(downtimeEvents)
      .where(
        and(
          eq(downtimeEvents.machineId, machineId),
          sql`${downtimeEvents.startTime} >= ${dayAgo}`
        )
      );

    const recentDowntimeMinutes = recentDowntimes.reduce(
      (acc, d) => acc + (d.durationMinutes || 0),
      0
    );

    const currentOEE = latestProd
      ? {
          availability: latestProd.availability,
          performance: latestProd.performance,
          quality: latestProd.quality,
          oee: latestProd.oee,
        }
      : { availability: 1, performance: 1, quality: 1, oee: 1 };

    return {
      machine,
      activeDowntime: activeDowntime || null,
      todayProduction: latestProd || null,
      currentOEE,
      recentDowntimeMinutes,
      downtimeEventCount: recentDowntimes.length,
    };
  }

  async getOEETrend(machineId: number, days: number = 7): Promise<OEETrendPoint[]> {
    if (!isDbConfigured) return this.fallback.getOEETrend(machineId, days);
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    const records = await db
      .select()
      .from(productionRecords)
      .where(
        and(
          eq(productionRecords.machineId, machineId),
          sql`${productionRecords.shiftDate} >= ${cutoffDate}`
        )
      )
      .orderBy(productionRecords.shiftDate, productionRecords.id);

    return records.map((p) => ({
      date: p.shiftDate,
      shift: p.shift,
      availability: p.availability,
      performance: p.performance,
      quality: p.quality,
      oee: p.oee,
      producedQuantity: p.producedQuantity,
      goodQuantity: p.goodQuantity,
      defectiveQuantity: p.defectiveQuantity,
    }));
  }

  async getGlobalOEEOverview(): Promise<MachineOEESummary[]> {
    if (!isDbConfigured) return this.fallback.getGlobalOEEOverview();
    const allMachines = await this.getAllMachines();
    const list: MachineOEESummary[] = [];
    for (const machine of allMachines) {
      if (machine.active) {
        const summary = await this.getMachineOEESummary(machine.id);
        list.push(summary);
      }
    }
    return list;
  }
}

export const storage = isDbConfigured
  ? new DatabaseStorage()
  : new MemStorage();
