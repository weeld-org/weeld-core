-- Enable required extension for UUID generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Tenants
CREATE TABLE IF NOT EXISTS tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL,
  created_at timestamp NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS tenants_slug_unique ON tenants(slug);

-- Users
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  password_hash text NOT NULL,
  created_at timestamp NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique ON users(email);

-- User <> Tenant membership
CREATE TABLE IF NOT EXISTS user_tenants (
  id serial PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  created_at timestamp NOT NULL DEFAULT now(),
  CONSTRAINT user_tenants_user_tenant_unique UNIQUE (user_id, tenant_id)
);

-- Roles
CREATE TABLE IF NOT EXISTS roles (
  id serial PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamp NOT NULL DEFAULT now(),
  CONSTRAINT roles_tenant_name_unique UNIQUE (tenant_id, name)
);

-- Permissions
CREATE TABLE IF NOT EXISTS permissions (
  id serial PRIMARY KEY,
  key text NOT NULL,
  description text
);
CREATE UNIQUE INDEX IF NOT EXISTS permissions_key_unique ON permissions(key);

-- Role <> Permission mapping
CREATE TABLE IF NOT EXISTS role_permissions (
  role_id integer NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id integer NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

-- User <> Role mapping
CREATE TABLE IF NOT EXISTS user_roles (
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id integer NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  CONSTRAINT user_roles_user_role_unique UNIQUE (user_id, role_id)
);

-- Plugins
CREATE TABLE IF NOT EXISTS plugins (
  id serial PRIMARY KEY,
  package_name text NOT NULL,
  version text NOT NULL,
  created_at timestamp NOT NULL DEFAULT now(),
  CONSTRAINT plugins_package_version_unique UNIQUE (package_name, version)
);

-- Tenant <> Plugin mapping
CREATE TABLE IF NOT EXISTS tenant_plugins (
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  plugin_id integer NOT NULL REFERENCES plugins(id) ON DELETE CASCADE,
  enabled boolean NOT NULL DEFAULT true,
  config text,
  CONSTRAINT tenant_plugins_unique UNIQUE (tenant_id, plugin_id)
);

