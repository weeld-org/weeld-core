import { Body, Controller, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { AdminCreateTenantDto } from './dto/admin-create-tenant.dto';
import { CreateTenantUserDto } from './dto/create-tenant-user.dto';
import type { Tenant, User } from '../db/schema';

@ApiTags('admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly service: AdminService) {}

  @Post('tenants')
  createTenant(@Body() dto: AdminCreateTenantDto): Promise<Tenant> {
    return this.service.createTenant({
      name: dto.name,
      slug: dto.slug,
      companyNumber: dto.companyNumber,
    });
  }

  @Post('tenants/:tenantId/users')
  createTenantUser(
    @Param('tenantId', new ParseUUIDPipe()) tenantId: string,
    @Body() dto: CreateTenantUserDto,
  ): Promise<User> {
    return this.service.createTenantUser(tenantId, dto);
  }
}
