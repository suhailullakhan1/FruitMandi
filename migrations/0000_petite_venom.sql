CREATE TABLE "bill_items" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"bill_id" varchar,
	"fruit_id" varchar,
	"weight" numeric(10, 3) NOT NULL,
	"rate" numeric(10, 2) NOT NULL,
	"amount" numeric(10, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bills" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"bill_number" text NOT NULL,
	"merchant_id" varchar,
	"subtotal" numeric(10, 2) NOT NULL,
	"transport_deduction" numeric(10, 2) DEFAULT '0.00',
	"commission_deduction" numeric(10, 2) DEFAULT '0.00',
	"other_deduction" numeric(10, 2) DEFAULT '0.00',
	"net_amount" numeric(10, 2) NOT NULL,
	"custom_message" text,
	"status" text DEFAULT 'pending',
	"created_by" varchar,
	"due_date" timestamp,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "bills_bill_number_unique" UNIQUE("bill_number")
);
--> statement-breakpoint
CREATE TABLE "fruits" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"variety" text,
	"current_rate" numeric(10, 2) NOT NULL,
	"unit" text DEFAULT 'kg',
	"is_active" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "merchants" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"merchant_code" text NOT NULL,
	"name" text NOT NULL,
	"phone" text NOT NULL,
	"address" text,
	"commission_rate" numeric(5, 2) DEFAULT '5.00',
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "merchants_merchant_code_unique" UNIQUE("merchant_code")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"phone" text NOT NULL,
	"role" text NOT NULL,
	"name" text NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_phone_unique" UNIQUE("phone")
);
--> statement-breakpoint
CREATE TABLE "weight_entries" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"merchant_id" varchar,
	"fruit_id" varchar,
	"entry_type" text DEFAULT 'single' NOT NULL,
	"weight" numeric(10, 3) NOT NULL,
	"number_of_crates" integer,
	"average_weight_per_crate" numeric(10, 3),
	"rate" numeric(10, 2) NOT NULL,
	"total_amount" numeric(10, 2) NOT NULL,
	"recorded_by" varchar,
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "bill_items" ADD CONSTRAINT "bill_items_bill_id_bills_id_fk" FOREIGN KEY ("bill_id") REFERENCES "public"."bills"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bill_items" ADD CONSTRAINT "bill_items_fruit_id_fruits_id_fk" FOREIGN KEY ("fruit_id") REFERENCES "public"."fruits"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bills" ADD CONSTRAINT "bills_merchant_id_merchants_id_fk" FOREIGN KEY ("merchant_id") REFERENCES "public"."merchants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bills" ADD CONSTRAINT "bills_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "merchants" ADD CONSTRAINT "merchants_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "weight_entries" ADD CONSTRAINT "weight_entries_merchant_id_merchants_id_fk" FOREIGN KEY ("merchant_id") REFERENCES "public"."merchants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "weight_entries" ADD CONSTRAINT "weight_entries_fruit_id_fruits_id_fk" FOREIGN KEY ("fruit_id") REFERENCES "public"."fruits"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "weight_entries" ADD CONSTRAINT "weight_entries_recorded_by_users_id_fk" FOREIGN KEY ("recorded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;