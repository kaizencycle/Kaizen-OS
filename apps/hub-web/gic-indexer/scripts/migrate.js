import { Pool } from 'pg';
import { readFileSync } from 'fs';
import { join } from 'path';

const db = new Pool({ connectionString: process.env.DATABASE_URL });
const migration = readFileSync(join(process.cwd(), 'db/migrations/20251019_gic_ubi.sql'), 'utf8');

try {
  await db.query(migration);
  console.log('Migration completed successfully');
  process.exit(0);
} catch (error) {
  console.error('Migration failed:', error);
  process.exit(1);
} finally {
  await db.end();
}

