import 'dotenv/config';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '../src/db/schema';
import { randomBytes, scryptSync } from 'node:crypto';

function hashPassword(plain: string): string {
  const salt = randomBytes(16).toString('hex');
  const derived = scryptSync(plain, salt, 64);
  return `${salt}:${derived.toString('hex')}`;
}

async function main(): Promise<void> {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set');
  const pool = new Pool({ connectionString: url });
  const db = drizzle(pool, { schema });

  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? 'admin@weeld.local';
  const adminPass = process.env.SEED_ADMIN_PASSWORD ?? 'ChangeMe!123';

  // Create demo tenant
  const [tenant] = await db
    .insert(schema.tenants)
    .values({ name: 'Demo', slug: 'demo', companyNumber: 'FRDEMO0000000000' })
    .onConflictDoNothing()
    .returning();

  // Create SaaS admin
  const [user] = await db
    .insert(schema.users)
    .values({ email: adminEmail, passwordHash: hashPassword(adminPass), saasAdmin: true })
    .onConflictDoNothing()
    .returning();

  if (tenant && user) {
    await db
      .insert(schema.userTenants)
      .values({ userId: user.id, tenantId: tenant.id })
      .onConflictDoNothing();
  }

  await pool.end();
  // eslint-disable-next-line no-console
  console.log('Seed completed');
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});

