import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Pool } from 'pg';
import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from './schema';

export const PG_POOL = 'PG_POOL';
export const DRIZZLE = 'DRIZZLE';
export type Database = NodePgDatabase<typeof schema>;

@Module({
  imports: [ConfigModule.forRoot()],
  providers: [
    {
      provide: PG_POOL,
      useFactory: (configService: ConfigService): Pool => {
        const connectionString = configService.get<string>('DATABASE_URL');
        if (!connectionString) {
          throw new Error('DATABASE_URL is not set');
        }
        const Ctor = Pool as unknown as {
          new (config: { connectionString: string }): Pool;
        };
        return new Ctor({ connectionString });
      },
      inject: [ConfigService],
    },
    {
      provide: DRIZZLE,
      useFactory: (pool: Pool): Database => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        return drizzle(pool, { schema }) as Database;
      },
      inject: [PG_POOL],
    },
  ],
  exports: [PG_POOL, DRIZZLE],
})
export class DatabaseModule {}
