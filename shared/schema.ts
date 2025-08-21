import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, decimal, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table for authentication
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  phone: text("phone").notNull().unique(),
  role: text("role").notNull(), // 'merchant', 'company', 'writer'
  name: text("name").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Merchants table
export const merchants = pgTable("merchants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  merchantCode: text("merchant_code").notNull().unique(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  address: text("address"),
  commissionRate: decimal("commission_rate", { precision: 5, scale: 2 }).default("5.00"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Fruits table for pricing
export const fruits = pgTable("fruits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  variety: text("variety"), // e.g., "Large", "Medium", "Small" for mangoes
  currentRate: decimal("current_rate", { precision: 10, scale: 2 }).notNull(),
  unit: text("unit").default("kg"),
  isActive: boolean("is_active").default(true),
});

// Weight entries
export const weightEntries = pgTable("weight_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  merchantId: varchar("merchant_id").references(() => merchants.id),
  fruitId: varchar("fruit_id").references(() => fruits.id),
  entryType: text("entry_type").notNull().default("single"), // 'single' or 'multiple'
  weight: decimal("weight", { precision: 10, scale: 3 }).notNull(),
  numberOfCrates: integer("number_of_crates"), // For multiple crate entries
  averageWeightPerCrate: decimal("average_weight_per_crate", { precision: 10, scale: 3 }), // For multiple crate entries
  rate: decimal("rate", { precision: 10, scale: 2 }).notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  recordedBy: varchar("recorded_by").references(() => users.id),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Bills
export const bills = pgTable("bills", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  billNumber: text("bill_number").notNull().unique(),
  merchantId: varchar("merchant_id").references(() => merchants.id),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  transportDeduction: decimal("transport_deduction", { precision: 10, scale: 2 }).default("0.00"),
  commissionDeduction: decimal("commission_deduction", { precision: 10, scale: 2 }).default("0.00"),
  otherDeduction: decimal("other_deduction", { precision: 10, scale: 2 }).default("0.00"),
  netAmount: decimal("net_amount", { precision: 10, scale: 2 }).notNull(),
  customMessage: text("custom_message"),
  status: text("status").default("pending"), // 'pending', 'completed', 'cancelled'
  createdBy: varchar("created_by").references(() => users.id),
  dueDate: timestamp("due_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Bill items
export const billItems = pgTable("bill_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  billId: varchar("bill_id").references(() => bills.id),
  fruitId: varchar("fruit_id").references(() => fruits.id),
  weight: decimal("weight", { precision: 10, scale: 3 }).notNull(),
  rate: decimal("rate", { precision: 10, scale: 2 }).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  merchant: one(merchants, {
    fields: [users.id],
    references: [merchants.userId],
  }),
  weightEntries: many(weightEntries),
  bills: many(bills),
}));

export const merchantsRelations = relations(merchants, ({ one, many }) => ({
  user: one(users, {
    fields: [merchants.userId],
    references: [users.id],
  }),
  weightEntries: many(weightEntries),
  bills: many(bills),
}));

export const fruitsRelations = relations(fruits, ({ many }) => ({
  weightEntries: many(weightEntries),
  billItems: many(billItems),
}));

export const weightEntriesRelations = relations(weightEntries, ({ one }) => ({
  merchant: one(merchants, {
    fields: [weightEntries.merchantId],
    references: [merchants.id],
  }),
  fruit: one(fruits, {
    fields: [weightEntries.fruitId],
    references: [fruits.id],
  }),
  recordedBy: one(users, {
    fields: [weightEntries.recordedBy],
    references: [users.id],
  }),
}));

export const billsRelations = relations(bills, ({ one, many }) => ({
  merchant: one(merchants, {
    fields: [bills.merchantId],
    references: [merchants.id],
  }),
  createdBy: one(users, {
    fields: [bills.createdBy],
    references: [users.id],
  }),
  items: many(billItems),
}));

export const billItemsRelations = relations(billItems, ({ one }) => ({
  bill: one(bills, {
    fields: [billItems.billId],
    references: [bills.id],
  }),
  fruit: one(fruits, {
    fields: [billItems.fruitId],
    references: [fruits.id],
  }),
}));

// Zod schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertMerchantSchema = createInsertSchema(merchants).omit({
  id: true,
  createdAt: true,
});

export const insertFruitSchema = createInsertSchema(fruits).omit({
  id: true,
});

export const insertWeightEntrySchema = createInsertSchema(weightEntries).omit({
  id: true,
  createdAt: true,
});

export const insertBillSchema = createInsertSchema(bills).omit({
  id: true,
  createdAt: true,
});

export const insertBillItemSchema = createInsertSchema(billItems).omit({
  id: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Merchant = typeof merchants.$inferSelect;
export type InsertMerchant = z.infer<typeof insertMerchantSchema>;

export type Fruit = typeof fruits.$inferSelect;
export type InsertFruit = z.infer<typeof insertFruitSchema>;

export type WeightEntry = typeof weightEntries.$inferSelect;
export type InsertWeightEntry = z.infer<typeof insertWeightEntrySchema>;

export type Bill = typeof bills.$inferSelect;
export type InsertBill = z.infer<typeof insertBillSchema>;

export type BillItem = typeof billItems.$inferSelect;
export type InsertBillItem = z.infer<typeof insertBillItemSchema>;
