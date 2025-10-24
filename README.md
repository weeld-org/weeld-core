# 🧭 WeelD — Core Platform

> WeelD is an open-source, modular SaaS platform for local businesses and artisans (bakeries, butchers, florists, cafés, and more). It provides a modern POS, warehouse and inventory management, and an extensible plugin-based architecture across backend and frontend.

---

## Table of Contents

- Mission
- Architecture Overview
- Tech Stack
- Multi-Tenant Design
- Plugin Runtime
- Development Setup
- Roadmap
- Create a Plugin
- API Docs
- Related Repositories
- License
- Maintainers

---

## 🚀 Mission

Build a multi-tenant cloud platform that provides:
- A lightweight and secure core (auth, tenants, RBAC, plugin runtime)
- Plug-and-play modules for business logic (POS, WMS, stock, delivery, loyalty, etc.)
- A dynamic UI layer where plugins inject pages and components seamlessly

Long-term goal: empower small businesses with simple, affordable, and extensible software — while enabling developers to build and publish their own modules.

---

## 🧩 Architecture Overview

### 1) Core (NestJS + PostgreSQL + Fastify)

The core provides:
- Multi-tenant authentication and RBAC
- Plugin loader with dynamic module injection
- Job queue (BullMQ + Redis)
- Event bus and webhooks
- Row Level Security (RLS) on PostgreSQL
- CLI tool (`weeld`) for tenants, migrations, and modules
- Offline sync groundwork

The core is intentionally minimal and evolves under LTS releases.

### 2) Backend Plugins

Each feature (POS, WMS, Stock, Wallet, etc.) lives as an independent plugin:
- Published as `@weeld/mod-<slug>` on npm
- Contains:
  - `manifest.json` (name, version, compatibility)
  - `register(ctx)` entrypoint
  - SQL migrations
  - Permissions (`pos:sale.create`, `wms:pick.read`)
- Loaded dynamically at runtime per tenant

Plugins can be official, partner, or community-maintained.

### 3) Frontend Plugins (UI Extensions)

The admin UI (Next.js + Tailwind + `@weeld/ui-sdk`) supports dynamic plugin injection.

Each UI plugin (`@weeld/mod-<slug>-ui`) provides:
- A `PluginUiManifest` (pages + slot components)
- Lazy-loaded imports (code-splitting)
- Delivery via npm (local) or remote ESM (CDN)

Only the UI plugins enabled for the current tenant are loaded.

---

## 🏗️ Tech Stack

| Layer         | Technology                     | Purpose                                         |
| ------------- | ------------------------------ | ----------------------------------------------- |
| Backend API   | NestJS + Fastify               | Modular, high-performance HTTP                  |
| Database      | PostgreSQL + Drizzle ORM       | SQL-first ORM with type-safe queries and RLS    |
| Queue         | BullMQ + Redis                 | Asynchronous jobs and background workers        |
| Cache         | Redis                          | Sessions, rate limits, ephemeral data           |
| Auth          | JWT + RBAC                     | Multi-user, tenant-aware authentication         |
| Frontend      | Next.js + Tailwind + UI SDK    | Offline-ready PWA and dynamic plugin UI         |
| Observability | Pino + Prometheus              | Structured logging and metrics                  |
| Tooling       | npm + workspaces               | Efficient dependency sharing                    |
| Validation    | Zod                            | Contract enforcement for API and plugin schemas |

---

## 🌍 Multi-Tenant Design

### Goal
Allow multiple businesses (tenants) to run on one infrastructure, securely isolated.

### Mechanism
- Each row in the database includes a `tenant_id` column.
- PostgreSQL Row Level Security (RLS) enforces isolation:

```sql
CREATE POLICY tenant_isolation ON sales
  FOR ALL
  USING (tenant_id = current_setting('weeld.tenant_id')::uuid);
```

A Nest middleware sets the tenant for each request using a scoped DB setting:

```ts
// example middleware sketch
requestContext.run({ tenantId }, async () => {
  await db.execute(sql`SET LOCAL weeld.tenant_id = ${tenantId}::uuid`);
  return next();
});
```

Benefits:
- One shared database → simpler operations
- True tenant isolation at the DB layer
- Easy scaling across many clients

---

## ⚙️ Plugin Runtime

### Backend

The core loads plugins dynamically at startup or per-tenant activation:

```ts
for (const mod of enabledPlugins(tenantId)) {
  const entry = await import(resolve(mod.package));
  validateManifest(entry.meta, sdkVersion);
  const ctx = makePluginContext({ tenantId });
  await runMigrations(entry);
  await entry.register(ctx);
}
```

Each plugin receives a sandboxed context with only allowed APIs:

```ts
type PluginContext = {
  http: FastifyInstance;
  db: DrizzleDatabase;
  events: EventBus;
  queue: JobQueue;
  rbac: RBAC;
  cache: CacheManager;
  files: FileService;
  webhooks: WebhookService;
  logger: Logger;
  config: Record<string, any>;
  secrets: (key: string) => string | undefined;
};
```

No plugin can access core internals directly — everything goes through `ctx`.

### Frontend

The frontend renders UI plugins discovered from an API endpoint, e.g. `/api/plugins/ui/enabled`:

```json
[
  {
    "name": "@weeld/mod-wms-ui",
    "source": { "type": "npm", "specifier": "@weeld/mod-wms-ui" },
    "version": "0.1.0"
  }
]
```

Rendering is fully dynamic:

```tsx
<SlotRenderer slot="Dashboard.Card" />
<PluginPageRouter path="/admin/wms" />
```

---

## 🧰 Development Setup

1) Clone and install

```bash
git clone https://github.com/weeld-org/weeld-core
cd weeld-core
npm install
```

2) Start Postgres

```bash
docker compose up -d db
```

3) Run migrations

```bash
npm run drizzle:migrate
```

4) Start API

```bash
npm run start:dev
```

Optional: using Make targets

```bash
make up              # start Postgres (docker compose up -d db)
make drizzle-migrate # run DB migrations
make start-dev       # start API in watch mode
```

---

## ⚙️ Configuration

- Uses NestJS `ConfigModule` to load environment variables (no direct `dotenv` import needed).
- Ensure `DATABASE_URL` is set in your environment or `.env` file, for example:

```env
DATABASE_URL=postgres://weeld:weeld@localhost:5432/weeld_core
```

- The DB provider validates `DATABASE_URL` on startup and fails fast if missing.

- See `.env.example` for a ready-to-copy template.

---

## 🔄 Roadmap

| Phase | Goal                                      | Status          |
| ----- | ----------------------------------------- | --------------- |
| 1     | Core API (Nest, Drizzle, RLS, CLI)        | ✅ Done         |
| 2     | Plugin system (loader, context, runtime)  | 🚧 In progress  |
| 3     | UI SDK (dynamic imports, slots, router)   | 🚧 In progress  |
| 4     | Official modules (POS, WMS, Stock)        | 🧩 Planned      |
| 5     | Offline sync (IndexedDB + worker)         | 🧩 Planned      |
| 6     | SaaS admin panel (billing, monitoring)    | 🧩 Planned      |
| 7     | App store / registry                      | 🧩 Planned      |

Developer philosophy:
- Build a modern, modular POS that anyone can extend and trust.
- Open Source First — forkable, auditable, improvable.
- Simplicity — minimal setup for small businesses.
- Scalability — from 10 to 10,000 tenants.
- Transparency — documented costs, performance, and APIs.

---

## 🧩 Create a Plugin

Scaffold a new module:

```bash
npx create-weeld-plugin mod-loyalty
```

You’ll get:

```
/src/index.ts        # register(ctx)
/migrations/001_init.sql
/manifest.json
```

Publish to npm:

```bash
npm publish --access public
```

Install for a tenant:

```bash
weeld plugins:install @weeld/mod-loyalty
```

---

## 📚 API Docs (Swagger)

- Available when `NODE_ENV` is not `production`.
- URL: `http://localhost:3000/docs` (or `PORT` as configured).
- Bearer Auth supported (Authorize button).

Example endpoint (form inputs):
- `POST /auth/login`
  - Consumes `application/x-www-form-urlencoded`
  - Fields: `username`, `password`

---

## 📦 Related Repositories

| Repository              | Description                               |
| ----------------------- | ----------------------------------------- |
| weeld-core              | Main backend and API core                 |
| weeld-mod-template      | Template for backend plugins              |
| weeld-mod-ui-template   | Template for frontend (UI) plugins        |
| weeld-registry          | Marketplace registry (plugins catalog)    |
| weeld-docs              | Technical documentation site              |
| weeld-actions           | Shared GitHub Actions workflows           |

---

## ⚖️ License

Apache License 2.0 — free to use, modify, and distribute under the terms of the Apache-2.0 license. Paid or proprietary plugins can coexist on top of the open-source core.

See: LICENSE-2.0

---

## 🧑‍💼 Maintainers

- @Klaiment — Founder & Lead Developer
- Community contributors — join via GitHub Discussions
