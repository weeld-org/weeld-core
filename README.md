# 🧭 WeelD — Core Platform

> **WeelD** is an **open-source modular SaaS platform** designed for **local businesses and artisans** — bakeries, butchers, florists, cafés, and more.  
> It provides a **modern POS**, **warehouse management**, and **inventory system**, extensible through a **plugin-based architecture** for both backend and frontend.

---

## 🚀 Mission

Build a **multi-tenant cloud platform** that provides:
- A **lightweight and secure core** (auth, tenants, RBAC, plugin runtime)
- **Plug-and-play modules** for business logic (POS, WMS, stock, delivery, loyalty, etc.)
- A **dynamic UI layer** where plugins inject pages and components seamlessly

WeelD’s long-term goal is to empower small businesses with **simple**, **affordable**, and **extensible** software — while letting developers easily **build and publish their own modules**.

---

## 🧩 Architecture Overview

### **1. Core (NestJS + PostgreSQL + Fastify)**

The WeelD Core provides:
- Multi-tenant **authentication and RBAC**
- **Plugin loader** with dynamic module injection
- **Job queue** (BullMQ + Redis)
- **Event bus** and webhooks
- **Row Level Security (RLS)** on PostgreSQL
- **CLI tool (`weeld`)** for managing tenants, migrations, and modules
- **Offline synchronization** groundwork

The core is intentionally **minimal** and evolves under LTS releases.

---

### **2. Backend Plugins**

Each feature (POS, WMS, Stock, Wallet, etc.) lives as an **independent plugin**:
- Published as `@weeld/mod-<slug>` on npm
- Contains:
    - `manifest.json` (name, version, compatibility)
    - `register(ctx)` entrypoint
    - SQL migrations
    - Permissions definitions (`pos:sale.create`, `wms:pick.read`)
- Loaded dynamically at runtime for each tenant

Back-end plugins can be **official**, **partner**, or **community-maintained**.

---

### **3. Frontend Plugins (UI Extensions)**

The admin UI (Next.js + Tailwind + `@weeld/ui-sdk`) supports **dynamic plugin injection**.

Each UI plugin (`@weeld/mod-<slug>-ui`) provides:
- A `PluginUiManifest` (pages + slot components)
- Lazy-loaded imports (code-splitting)
- Optional delivery:
    - via **npm** (locally installed)
    - or as **remote ESM** (served from CDN)

The front loads only the **UI plugins enabled for the current tenant** — no extra bloat.

---

## 🏗️ Tech Stack

| Layer | Technology | Purpose |
|-------|-------------|----------|
| Backend API | **NestJS + Fastify** | Modular, high-performance HTTP framework |
| Database | **PostgreSQL + Drizzle ORM** | SQL-first ORM with type-safe queries and RLS |
| Queue | **BullMQ + Redis** | Asynchronous jobs and background workers |
| Cache | **Redis** | Sessions, rate limits, ephemeral data |
| Auth | **JWT + RBAC** | Multi-user, tenant-aware authentication |
| Frontend | **Next.js + Tailwind + UI SDK** | Offline-ready PWA and dynamic plugin UI |
| Observability | **Pino + Prometheus** | Structured logging and metrics |
| Tooling | **pnpm + monorepo workspaces** | Efficient dependency sharing |
| Validation | **Zod** | Contract enforcement for API and plugin schemas |

---

## 🌍 Multi-Tenant Design

### 🎯 Goal
Allow multiple businesses (tenants) to run on one infrastructure, securely isolated.

### 🔐 Mechanism
- Each row in the database includes a `tenant_id` column.
- PostgreSQL **Row Level Security (RLS)** enforces isolation:
  ```sql
  CREATE POLICY tenant_isolation ON sales
  FOR ALL USING (tenant_id = current_setting('weeld.tenant_id')::uuid);

A Nest middleware sets SET LOCAL weeld.tenant_id = $tenant_id per request.

✅ Benefits

One shared database = simple ops

True tenant isolation (enforced at DB level)

Easy scaling across many clients

⚙️ Plugin Runtime (Backend)

The core loads plugins dynamically at startup or per-tenant activation:

for (const mod of enabledPlugins(tenantId)) {
const entry = await import(resolve(mod.package));
validateManifest(entry.meta, sdkVersion);
const ctx = makePluginContext({ tenantId });
await runMigrations(entry);
await entry.register(ctx);
}

PluginContext object

Each plugin receives a sandboxed context with only the allowed APIs:

{
http: FastifyInstance,
db: DrizzleDatabase,
events: EventBus,
queue: JobQueue,
rbac: RBAC,
cache: CacheManager,
files: FileService,
webhooks: WebhookService,
logger: Logger,
config: Record<string, any>,
secrets: (key: string) => string | undefined
}


No plugin can access core internals directly — everything passes through ctx.

🖥️ Frontend Plugin Runtime

The frontend dynamically renders UI plugins through /api/plugins/ui/enabled.

Example response:

[
{
"name": "@weeld/mod-wms-ui",
"source": { "type": "npm", "specifier": "@weeld/mod-wms-ui" },
"version": "0.1.0"
}
]


Rendering is fully dynamic:

<SlotRenderer slot="Dashboard.Card" />
<PluginPageRouter path="/admin/wms" />

🧰 Development Setup
1. Install dependencies
   git clone https://github.com/weeld/weeld-core
   cd weeld-core
   pnpm install

2. Start Postgres + Redis
   docker compose up -d postgres redis

3. Run migrations
   pnpm db:migrate

4. Start API + Frontend
   pnpm dev

🔄 Roadmap
Phase	Goal	Status
1. Foundation	Core API (Nest, Drizzle, RLS, CLI)	✅ Done
2. Plugin System	Loader, context, manifest, runtime	🚧 In Progress
3. UI SDK	Dynamic imports, slots, page router	🚧 In Progress
4. Official Modules	POS, WMS, Stock	🧩 Planned
5. Offline Sync	IndexedDB + Background Worker	🧩 Planned
6. SaaS Admin Panel	Billing, subscriptions, monitoring	🧩 Planned
7. App Store / Registry	Plugin discovery and marketplace	🧩 Planned
   🧑‍💻 Developer Philosophy

“Build a modern, modular POS that anyone can extend and trust.”

Open Source First – everything can be forked, audited, and improved.

Simplicity – designed for small businesses with minimal setup.

Scalability – capable of serving 10 to 10,000 tenants.

Transparency – all costs, performance, and APIs are documented.

🧩 Create Your Own Plugin
pnpm dlx create-weeld-plugin mod-loyalty


You’ll get:

/src/index.ts       # register(ctx)
/migrations/001_init.sql

---

## API Docs (Swagger)

- Disponible uniquement si `NODE_ENV` ≠ `production`.
- URL: `http://localhost:${PORT:-3000}/docs`
- Auth Bearer: activée (bouton Authorize).

Endpoint d’exemple (inputs formulaires):
- `POST /auth/login`
  - Consomme `application/x-www-form-urlencoded`
  - Champs: `username`, `password`

/manifest.json


Publish to npm:

npm publish --access public


The plugin becomes instantly installable:

weeld plugins:install @weeld/mod-loyalty

🧠 Why “WeelD”?

Wheel + D — “The Wheel of Development”
A modular ecosystem that keeps rolling, evolving, and growing with its community.

⚖️ License

MIT License — free to use, modify, and distribute.
Paid or proprietary plugins can coexist above the open-source core.

📦 Related Repositories
Repository	Description
weeld-core
The main backend and API core
weeld-mod-template
Template for backend plugins
weeld-mod-ui-template
Template for frontend (UI) plugins
weeld-registry
Marketplace registry (plugins catalog)
weeld-docs
Technical documentation site
weeld-actions
Shared GitHub Actions workflows
🧑‍💼 Maintainers

@klaiment62 — Founder & Lead Developer

Community contributors — join via GitHub Discussions
