import { Test } from '@nestjs/testing';
import { TenantsController } from '../src/tenants/tenants.controller';
import { TenantsService } from '../src/tenants/tenants.service';
import { makeCreateTenantDto } from './fixtures/tenant.fixtures';

describe('TenantsController', () => {
  it('calls service.create with dto', async () => {
    const serviceMock: Pick<
      TenantsService,
      'create' | 'findAll' | 'findOne' | 'update' | 'remove'
    > = {
      create: (input) =>
        Promise.resolve({
          id: 'uuid',
          name: input.name,
          slug: input.slug,
          companyNumber: 'FR00000000000000',
          createdAt: new Date(),
        }),
      findAll: () => Promise.resolve([]),
      findOne: () =>
        Promise.resolve({
          id: 'uuid',
          name: 'n',
          slug: 's',
          companyNumber: 'FR00000000000000',
          createdAt: new Date(),
        }),
      update: () =>
        Promise.resolve({
          id: 'uuid',
          name: 'n',
          slug: 's',
          companyNumber: 'FR00000000000000',
          createdAt: new Date(),
        }),
      remove: () => Promise.resolve(),
    };

    const moduleRef = await Test.createTestingModule({
      controllers: [TenantsController],
      providers: [{ provide: TenantsService, useValue: serviceMock }],
    }).compile();

    const controller = moduleRef.get(TenantsController);
    const dto = makeCreateTenantDto();
    const created = await controller.create(dto);
    expect(created).toHaveProperty('id');
  });
});
