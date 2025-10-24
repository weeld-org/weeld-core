import { sql } from 'drizzle-orm';
import {
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  boolean,
  integer,
} from 'drizzle-orm/pg-core';

// ========== Core Entities ==========

export const tenants = pgTable(
  'tenants',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    name: text('name').notNull(),
    slug: text('slug').notNull(),
    createdAt: timestamp('created_at', { withTimezone: false })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    slugUnique: uniqueIndex('tenants_slug_unique').on(table.slug),
  }),
);

export const users = pgTable(
  'users',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    email: text('email').notNull(),
    passwordHash: text('password_hash').notNull(),
    createdAt: timestamp('created_at', { withTimezone: false })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    emailUnique: uniqueIndex('users_email_unique').on(table.email),
  }),
);

// Link users to tenants (membership)
export const userTenants = pgTable(
  'user_tenants',
  {
    id: serial('id').primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: false })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    userTenantUnique: uniqueIndex('user_tenants_user_tenant_unique').on(
      table.userId,
      table.tenantId,
    ),
  }),
);

// ========== RBAC ==========

export const roles = pgTable(
  'roles',
  {
    id: serial('id').primaryKey(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    createdAt: timestamp('created_at', { withTimezone: false })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    tenantNameUnique: uniqueIndex('roles_tenant_name_unique').on(
      table.tenantId,
      table.name,
    ),
  }),
);

export const permissions = pgTable(
  'permissions',
  {
    id: serial('id').primaryKey(),
    key: text('key').notNull(), // e.g., 'pos:sale.create'
    description: text('description'),
  },
  (table) => ({
    keyUnique: uniqueIndex('permissions_key_unique').on(table.key),
  }),
);

export const rolePermissions = pgTable('role_permissions', {
  roleId: integer('role_id')
    .notNull()
    .references(() => roles.id, { onDelete: 'cascade' }),
  permissionId: integer('permission_id')
    .notNull()
    .references(() => permissions.id, { onDelete: 'cascade' }),
});

export const userRoles = pgTable(
  'user_roles',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    roleId: integer('role_id')
      .notNull()
      .references(() => roles.id, { onDelete: 'cascade' }),
  },
  (table) => ({
    userRoleUnique: uniqueIndex('user_roles_user_role_unique').on(
      table.userId,
      table.roleId,
    ),
  }),
);

// ========== Plugins ==========

export const plugins = pgTable(
  'plugins',
  {
    id: serial('id').primaryKey(),
    packageName: text('package_name').notNull(), // e.g., '@weeld/mod-wms'
    version: text('version').notNull(),
    createdAt: timestamp('created_at', { withTimezone: false })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    packageUnique: uniqueIndex('plugins_package_version_unique').on(
      table.packageName,
      table.version,
    ),
  }),
);

export const tenantPlugins = pgTable(
  'tenant_plugins',
  {
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    pluginId: integer('plugin_id')
      .notNull()
      .references(() => plugins.id, { onDelete: 'cascade' }),
    enabled: boolean('enabled').notNull().default(true),
    // JSON config kept as text for maximum portability; can switch to jsonb
    config: text('config'),
  },
  (table) => ({
    tenantPluginUnique: uniqueIndex('tenant_plugins_unique').on(
      table.tenantId,
      table.pluginId,
    ),
  }),
);

// ========== Type Exports ==========

export type Tenant = typeof tenants.$inferSelect;
export type NewTenant = typeof tenants.$inferInsert;

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type UserTenant = typeof userTenants.$inferSelect;
export type NewUserTenant = typeof userTenants.$inferInsert;

export type Role = typeof roles.$inferSelect;
export type NewRole = typeof roles.$inferInsert;

export type Permission = typeof permissions.$inferSelect;
export type NewPermission = typeof permissions.$inferInsert;

export type RolePermission = typeof rolePermissions.$inferSelect;
export type NewRolePermission = typeof rolePermissions.$inferInsert;

export type UserRole = typeof userRoles.$inferSelect;
export type NewUserRole = typeof userRoles.$inferInsert;

export type Plugin = typeof plugins.$inferSelect;
export type NewPlugin = typeof plugins.$inferInsert;

export type TenantPlugin = typeof tenantPlugins.$inferSelect;
export type NewTenantPlugin = typeof tenantPlugins.$inferInsert;
