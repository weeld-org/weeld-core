import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE, type Database } from '../db/database.module';
import {
  tenants,
  users,
  userTenants,
  type NewTenant,
  type Tenant,
  type User,
} from '../db/schema';
import { randomBytes, scryptSync } from 'node:crypto';

@Injectable()
export class AdminService {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  async createTenant(
    input: Pick<NewTenant, 'name' | 'slug' | 'companyNumber'>,
  ): Promise<Tenant> {
    const [created] = await this.db
      .insert(tenants)
      .values({
        name: input.name,
        slug: input.slug,
        companyNumber: input.companyNumber,
      })
      .returning();
    return created;
  }

  async createTenantUser(
    tenantId: string,
    input: { email: string; password: string; saasAdmin?: boolean },
  ): Promise<User> {
    const [tenant] = await this.db
      .select()
      .from(tenants)
      .where(eq(tenants.id, tenantId));
    if (!tenant) throw new NotFoundException('Tenant not found');

    const salt: string = randomBytes(16).toString('hex');
    const derived = scryptSync(input.password, salt, 64);
    const passwordHash: string = `${salt}:${derived.toString('hex')}`;
    const [user] = await this.db
      .insert(users)
      .values({
        email: input.email,
        passwordHash,
        saasAdmin: Boolean(input.saasAdmin),
      })
      .onConflictDoNothing()
      .returning();

    const userId =
      user?.id ??
      (await this.db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, input.email))
        .then((r) => r[0]?.id));
    if (!userId) throw new Error('Failed to create or fetch user');

    await this.db
      .insert(userTenants)
      .values({ userId, tenantId })
      .onConflictDoNothing();

    const [attached] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, userId));
    return attached as User;
  }
}
