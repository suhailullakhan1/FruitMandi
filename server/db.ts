
import 'dotenv/config';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Use connection pooling for better performance with Replit PostgreSQL
const poolUrl = process.env.DATABASE_URL.includes('-pooler.') 
  ? process.env.DATABASE_URL 
  : process.env.DATABASE_URL.replace('.us-east-2', '-pooler.us-east-2');

const pool = new Pool({
  connectionString: poolUrl,
  max: 10,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

export const db = drizzle(pool, { schema });
