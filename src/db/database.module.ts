import { Module } from '@nestjs/common';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import 'dotenv/config';

export const PG_POOL = 'PG_POOL';
export const DRIZZLE = 'DRIZZLE';

@Module({
  providers: [
    {
      provide: PG_POOL,
      useFactory: () => {
        const connectionString = process.env.DATABASE_URL;
        if (!connectionString) {
          throw new Error('DATABASE_URL is not set');
        }
        return new Pool({ connectionString });
      },
    },
    {
      provide: DRIZZLE,
      useFactory: (pool: Pool) => drizzle(pool),
      inject: [PG_POOL],
    },
  ],
  exports: [PG_POOL, DRIZZLE],
})
export class DatabaseModule {}

