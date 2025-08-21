import { 
  users, merchants, fruits, weightEntries, bills, billItems,
  type User, type InsertUser, type Merchant, type InsertMerchant,
  type Fruit, type InsertFruit, type WeightEntry, type InsertWeightEntry,
  type Bill, type InsertBill, type BillItem, type InsertBillItem
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUserByPhone(phone: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUserById(id: string): Promise<User | undefined>;

  // Merchant operations
  getMerchants(): Promise<Merchant[]>;
  getMerchantById(id: string): Promise<Merchant | undefined>;
  createMerchant(merchant: InsertMerchant): Promise<Merchant>;
  updateMerchant(id: string, merchant: Partial<Merchant>): Promise<Merchant | undefined>;

  // Fruit operations
  getFruits(): Promise<Fruit[]>;
  getFruitById(id: string): Promise<Fruit | undefined>;
  updateFruitRate(id: string, rate: string): Promise<Fruit | undefined>;

  // Weight entry operations
  createWeightEntry(entry: InsertWeightEntry): Promise<WeightEntry>;
  getWeightEntries(): Promise<WeightEntry[]>;
  getWeightEntriesByMerchant(merchantId: string): Promise<WeightEntry[]>;

  // Bill operations
  createBill(bill: InsertBill): Promise<Bill>;
  createBillItems(items: InsertBillItem[]): Promise<BillItem[]>;
  getBills(): Promise<any[]>;
  getBillById(id: string): Promise<any>;
  updateBillStatus(id: string, status: string): Promise<Bill | undefined>;

  // Analytics
  getDashboardStats(): Promise<{
    merchantCount: number;
    todayRevenue: string;
    totalWeight: string;
    transactionCount: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  async getUserByPhone(phone: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.phone, phone));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getUserById(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getMerchants(): Promise<Merchant[]> {
    return await db.select().from(merchants).where(eq(merchants.isActive, true));
  }

  async getMerchantById(id: string): Promise<Merchant | undefined> {
    const [merchant] = await db.select().from(merchants).where(eq(merchants.id, id));
    return merchant || undefined;
  }

  async createMerchant(insertMerchant: InsertMerchant): Promise<Merchant> {
    const [merchant] = await db.insert(merchants).values(insertMerchant).returning();
    return merchant;
  }

  async updateMerchant(id: string, merchant: Partial<Merchant>): Promise<Merchant | undefined> {
    const [updated] = await db.update(merchants)
      .set(merchant)
      .where(eq(merchants.id, id))
      .returning();
    return updated || undefined;
  }

  async getFruits(): Promise<Fruit[]> {
    return await db.select().from(fruits).where(eq(fruits.isActive, true));
  }

  async getFruitById(id: string): Promise<Fruit | undefined> {
    const [fruit] = await db.select().from(fruits).where(eq(fruits.id, id));
    return fruit || undefined;
  }

  async updateFruitRate(id: string, rate: string): Promise<Fruit | undefined> {
    const [updated] = await db.update(fruits)
      .set({ currentRate: rate })
      .where(eq(fruits.id, id))
      .returning();
    return updated || undefined;
  }

  async createWeightEntry(entry: InsertWeightEntry): Promise<WeightEntry> {
    const [weightEntry] = await db.insert(weightEntries).values(entry).returning();
    return weightEntry;
  }

  async getWeightEntries(): Promise<any[]> {
    const entries = await db
      .select({
        id: weightEntries.id,
        entryType: weightEntries.entryType,
        weight: weightEntries.weight,
        numberOfCrates: weightEntries.numberOfCrates,
        averageWeightPerCrate: weightEntries.averageWeightPerCrate,
        rate: weightEntries.rate,
        totalAmount: weightEntries.totalAmount,
        notes: weightEntries.notes,
        createdAt: weightEntries.createdAt,
        merchant: {
          id: merchants.id,
          name: merchants.name,
          merchantCode: merchants.merchantCode,
        },
        fruit: {
          id: fruits.id,
          name: fruits.name,
          variety: fruits.variety,
          unit: fruits.unit,
        },
        recordedBy: {
          id: users.id,
          name: users.name,
        }
      })
      .from(weightEntries)
      .innerJoin(merchants, eq(weightEntries.merchantId, merchants.id))
      .innerJoin(fruits, eq(weightEntries.fruitId, fruits.id))
      .innerJoin(users, eq(weightEntries.recordedBy, users.id))
      .orderBy(desc(weightEntries.createdAt));
    
    return entries;
  }

  async getWeightEntriesByMerchant(merchantId: string): Promise<WeightEntry[]> {
    return await db.select().from(weightEntries)
      .where(eq(weightEntries.merchantId, merchantId))
      .orderBy(desc(weightEntries.createdAt));
  }

  async createBill(bill: InsertBill): Promise<Bill> {
    const [newBill] = await db.insert(bills).values(bill).returning();
    return newBill;
  }

  async createBillItems(items: InsertBillItem[]): Promise<BillItem[]> {
    return await db.insert(billItems).values(items).returning();
  }

  async getBills(): Promise<any[]> {
    return await db.select({
      id: bills.id,
      billNumber: bills.billNumber,
      subtotal: bills.subtotal,
      transportDeduction: bills.transportDeduction,
      commissionDeduction: bills.commissionDeduction,
      otherDeduction: bills.otherDeduction,
      netAmount: bills.netAmount,
      status: bills.status,
      dueDate: bills.dueDate,
      createdAt: bills.createdAt,
      merchant: {
        name: merchants.name,
        merchantCode: merchants.merchantCode,
      }
    })
    .from(bills)
    .leftJoin(merchants, eq(bills.merchantId, merchants.id))
    .orderBy(desc(bills.createdAt));
  }

  async getBillById(id: string): Promise<any> {
    // Get bill with merchant details
    const [bill] = await db.select({
      id: bills.id,
      billNumber: bills.billNumber,
      subtotal: bills.subtotal,
      transportDeduction: bills.transportDeduction,
      commissionDeduction: bills.commissionDeduction,
      otherDeduction: bills.otherDeduction,
      netAmount: bills.netAmount,
      status: bills.status,
      dueDate: bills.dueDate,
      createdAt: bills.createdAt,
      customMessage: bills.customMessage,
      merchant: {
        name: merchants.name,
        merchantCode: merchants.merchantCode,
        address: merchants.address,
        phone: merchants.phone,
      }
    })
    .from(bills)
    .leftJoin(merchants, eq(bills.merchantId, merchants.id))
    .where(eq(bills.id, id));

    if (!bill) return undefined;

    // Get bill items with fruit details
    const items = await db.select({
      id: billItems.id,
      weight: billItems.weight,
      rate: billItems.rate,
      amount: billItems.amount,
      fruit: {
        name: fruits.name,
        unit: fruits.unit,
      }
    })
    .from(billItems)
    .leftJoin(fruits, eq(billItems.fruitId, fruits.id))
    .where(eq(billItems.billId, id));

    return {
      ...bill,
      items
    };
  }

  async updateBillStatus(id: string, status: string): Promise<Bill | undefined> {
    const [updated] = await db.update(bills)
      .set({ status })
      .where(eq(bills.id, id))
      .returning();
    return updated || undefined;
  }

  async getDashboardStats(): Promise<{
    merchantCount: number;
    todayRevenue: string;
    totalWeight: string;
    transactionCount: number;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const [merchantCount] = await db.select({ 
      count: sql<number>`count(*)::int` 
    }).from(merchants).where(eq(merchants.isActive, true));

    const [todayRevenue] = await db.select({
      revenue: sql<string>`coalesce(sum(net_amount), '0')::text`
    }).from(bills).where(
      and(
        sql`date(created_at) = date(${today.toISOString()})`,
        eq(bills.status, 'completed')
      )
    );

    const [totalWeight] = await db.select({
      weight: sql<string>`coalesce(sum(weight), '0')::text`
    }).from(weightEntries).where(
      sql`date(created_at) = date(${today.toISOString()})`
    );

    const [transactionCount] = await db.select({
      count: sql<number>`count(*)::int`
    }).from(weightEntries).where(
      sql`date(created_at) = date(${today.toISOString()})`
    );

    return {
      merchantCount: merchantCount.count || 0,
      todayRevenue: todayRevenue.revenue || '0',
      totalWeight: totalWeight.weight || '0',
      transactionCount: transactionCount.count || 0
    };
  }
}

export const storage = new DatabaseStorage();
