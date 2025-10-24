import { Test } from '@nestjs/testing';
import { AdminController } from '../src/admin/admin.controller';
import { AdminService } from '../src/admin/admin.service';
import { makeAdminCreateTenantDto } from './fixtures/tenant.fixtures';
import type { Tenant, User } from '../src/db/schema';

describe('AdminController', () => {
  it('creates tenant with company number', async () => {
    const serviceMock: Pick<AdminService, 'createTenant' | 'createTenantUser'> =
      {
        createTenant: (input) =>
          Promise.resolve({
            id: 'uuid',
            name: input.name,
            slug: input.slug,
            companyNumber: input.companyNumber,
            createdAt: new Date(),
          } as Tenant),
        createTenantUser: () =>
          Promise.resolve({
            id: 'uuid',
            email: 'u@e.com',
            passwordHash: 'h',
            saasAdmin: false,
            createdAt: new Date(),
          } as User),
      };

    const moduleRef = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [{ provide: AdminService, useValue: serviceMock }],
    }).compile();

    const controller = moduleRef.get(AdminController);
    const dto = makeAdminCreateTenantDto();
    const created = await controller.createTenant(dto);
    expect(created).toHaveProperty('companyNumber', dto.companyNumber);
  });
});
