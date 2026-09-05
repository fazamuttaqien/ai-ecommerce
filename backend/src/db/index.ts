import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';

import { envConfig } from '../config/env.config';
import { relations } from './relations';

const pool = new Pool({
  connectionString: envConfig.DATABASE_URL,
  max: envConfig.NODE_ENV === 'test' ? 1 : undefined,
});

export const db = drizzle({ client: pool, relations });

export const connectDatabase = async (): Promise<void> => {
  try {
    await pool.query('SELECT 1');
    console.log('Database connected!');
  } catch (error) {
    console.error('Database connection error', error);
    process.exit(1);
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  await pool.end();
};

export * from './schema';
export * from './relations';
