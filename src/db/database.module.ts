import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Pool } from 'pg';
import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';

export const PG_POOL = 'PG_POOL';
export const DRIZZLE = 'DRIZZLE';

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
      useFactory: (
        pool: Pool /*, configService: ConfigService*/,
      ): NodePgDatabase => {
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
