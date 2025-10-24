import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE, type Database } from '../db/database.module';
import { tenants, type NewTenant, type Tenant } from '../db/schema';

@Injectable()
export class TenantsService {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  async create(input: NewTenant): Promise<Tenant> {
    const [created] = await this.db
      .insert(tenants)
      .values({ name: input.name, slug: input.slug })
      .returning();
    return created;
  }

  async findAll(): Promise<Tenant[]> {
    const rows = await this.db.select().from(tenants);
    return rows as Tenant[];
  }

  async findOne(id: string): Promise<Tenant> {
    const [row] = await this.db
      .select()
      .from(tenants)
      .where(eq(tenants.id, id));
    if (!row) throw new NotFoundException('Tenant not found');
    return row as Tenant;
  }

  async update(id: string, input: Partial<NewTenant>): Promise<Tenant> {
    const [row] = await this.db
      .update(tenants)
      .set({ ...input })
      .where(eq(tenants.id, id))
      .returning();
    if (!row) throw new NotFoundException('Tenant not found');
    return row as Tenant;
  }

  async remove(id: string): Promise<void> {
    const removed = await this.db
      .delete(tenants)
      .where(eq(tenants.id, id))
      .returning({ id: tenants.id });
    if (removed.length === 0) throw new NotFoundException('Tenant not found');
  }
}
