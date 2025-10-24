import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './db/database.module';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { TenantsModule } from './tenants/tenants.module';

@Module({
  imports: [DatabaseModule, AuthModule, TenantsModule, AdminModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
