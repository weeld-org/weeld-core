import { Module } from '@nestjs/common';
import { Pool } from 'pg';
import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import 'dotenv/config';

export const PG_POOL = 'PG_POOL';
export const DRIZZLE = 'DRIZZLE';

@Module({
  providers: [
    {
      provide: PG_POOL,
      useFactory: (): Pool => {
        const connectionString = process.env.DATABASE_URL;
        if (!connectionString) {
          throw new Error('DATABASE_URL is not set');
        }
        const Ctor = Pool as unknown as {
          new (config: { connectionString: string }): Pool;
        };
        return new Ctor({ connectionString });
      },
    },
    {
      provide: DRIZZLE,
      useFactory: (pool: Pool): NodePgDatabase => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        const db = drizzle(pool) as NodePgDatabase;
        return db;
      },
      inject: [PG_POOL],
    },
  ],
  exports: [PG_POOL, DRIZZLE],
})
export class DatabaseModule {}
