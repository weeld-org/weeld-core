import { CreateTenantDto } from '../../src/tenants/dto/create-tenant.dto';
import { AdminCreateTenantDto } from '../../src/admin/dto/admin-create-tenant.dto';

export const makeCreateTenantDto = (
  overrides?: Partial<CreateTenantDto>,
): CreateTenantDto => ({
  name: 'Acme Corp',
  slug: 'acme-corp',
  ...overrides,
});

export const makeAdminCreateTenantDto = (
  overrides?: Partial<AdminCreateTenantDto>,
): AdminCreateTenantDto => ({
  name: 'Acme Corp',
  slug: 'acme-corp',
  companyNumber: 'FR00000000000000',
  ...overrides,
});
