import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import dotenv from 'dotenv';
import * as schema from './schema';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Drizzle instance for type-safe queries
export const db = drizzle(pool, { schema });

// Raw pool for existing routes (backwards compatible)
export default pool;
