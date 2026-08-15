# Event Planner specifications

These specifications define the planned expansion of the existing Sydney Gig
Planner learning application into a customizable, multi-tenant event-planning
platform.

## Status

Product discovery is complete. Requirements marked **Agreed** reflect decisions
made during the specification interview. Deliberately deferred vendor choices
and low-level implementation details are identified where relevant and do not
change the agreed product boundaries.

## Documents

- [Product and tenancy requirements](./product-and-tenancy.md)
- [Domain and collaboration requirements](./domain-and-collaboration.md)
- [Applications and identity](./applications-and-identity.md)
- [Events, custom fields, and plans](./events-custom-fields-and-plans.md)
- [Backend, persistence, and API](./backend-persistence-and-api.md)
- [Lifecycle, proposals, and recovery](./lifecycle-proposals-and-recovery.md)
- [MCP, security, and background work](./mcp-security-and-background-work.md)
- [Runtime, operations, and quality](./runtime-operations-and-quality.md)
- [Migration and delivery](./migration-and-delivery.md)
- [Sessions, role grants, and secrets](./sessions-roles-and-secrets.md)
- [Architecture overview](./architecture-overview.md)
- [Permission matrix](./permission-matrix.md)
- [Phased roadmap](./roadmap.md)
- [Traceability checklist](./traceability.md)
- [Execution plans](./execution/README.md)

The consolidated documents summarize the detailed requirements; the detailed
capability specifications remain authoritative when more context is needed.

Execution plans translate roadmap phases into bounded implementation work. They
do not override the product or architecture specifications.

## Existing system context

- The member-facing application is a React 19, Vite, React Router, and TanStack
  Query SPA.
- Event administration currently lives under `/admin` in that SPA.
- The frontend consumes an OpenAPI-described `/api/v1` HTTP API and generates
  its TypeScript client with Orval.
- The sibling ASP.NET Core API persists data with EF Core and SQLite. Its
  provider composition already supports SQLite, PostgreSQL, or SQL Server, but
  feature code currently accesses EF Core directly.
- Authentication is currently a development-only header-based role switch,
  with optional JWT bearer validation configured for non-development use.
