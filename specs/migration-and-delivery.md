# Migration and delivery

## Existing data migration

**Status: Agreed**

The existing Sydney Gig Planner demonstration becomes the first seeded Event
Planner tenant. Its current artists become Participants, venues become Places,
and events become tenant-owned Events. The existing demonstration user becomes
an owner of that tenant.

Existing favourites become tenant-scoped favourites for that user. Existing
weekend plans become named plans with the corresponding weekend date range and
ordered entries. Stable identifiers should be preserved where compatible so
existing references and migration verification remain straightforward.

The migration is deterministic, repeatable for a clean development database,
and covered by tests for record counts, relationships, tenant assignment, and
user-owned data.

## Incremental transition

**Status: Agreed**

The current member experience remains runnable while tenant-aware backend and
frontend capabilities are introduced. Migration uses controlled vertical
slices rather than a single rewrite cutover.

Embedded React admin routes remain available only until equivalent Next.js
workflows meet their acceptance tests. They are then removed rather than
maintained as a second administration implementation. Temporary compatibility
code must be marked and removed by an explicit delivery milestone.

## Initial usable milestone

**Status: Agreed**

The first end-to-end usable milestone contains:

- development login and seeded personas;
- tenant creation;
- tenant selection and switching;
- tenant-aware catalogue browsing;
- a separately runnable Next.js tenant-admin application;
- tenant membership invitations and agreed roles;
- named personal plans;
- SQLite persistence behind application repository ports;
- automated tenant-isolation tests.

Custom fields, plan collaboration, platform administration, tenant export,
external integration APIs, and MCP follow in later milestones. Their designs
remain part of the target architecture so early schemas and contracts do not
needlessly block them.

## Vertical-slice implementation

**Status: Agreed**

Implementation proceeds by complete business use case across domain,
application, persistence, HTTP contract, generated client, relevant frontend,
observability, and automated tests. Work should not build every database entity
first, then every endpoint, then every page.

Each slice has explicit acceptance behavior, authorization cases, tenant
isolation cases, error responses, and migration impact. Shared abstractions are
extracted when at least one real slice demonstrates the need.

## Visual direction

**Status: Agreed initially**

Both applications use a deliberately stripped-back black-and-white visual
system for the initial expansion:

- neutral black, white, and grey palette;
- clear typography and spacing;
- simple borders and state indicators rather than decorative effects;
- minimal imagery beyond tenant catalogue content;
- no initial tenant color or theme customization;
- utilitarian, information-dense admin screens.

The visual simplification may replace the current violet-heavy presentation,
but it should preserve working information architecture and interaction
behavior until a slice intentionally changes them. A small shared token and
primitive package may support consistency, while each application retains
control of its own page composition and framework-specific behavior.

Formal accessibility and responsive acceptance remain deferred as specified in
[Runtime, operations, and quality](./runtime-operations-and-quality.md).

## Required testing

**Status: Agreed**

Delivery uses all of these testing levels:

- focused domain and application unit tests;
- API integration tests using a real configured database provider;
- migration and seed verification;
- OpenAPI snapshot and generated-client freshness checks;
- member React and admin Next.js component/integration tests;
- Playwright journeys for authentication, tenant switching, tenant creation,
  administration, invitations, and plan workflows;
- mandatory cross-tenant negative authorization tests;
- background-job retry and idempotency tests;
- integration proposal idempotency and approval tests when those milestones
  begin.

Tests should assert business behavior and contracts rather than implementation
details where possible.

## Continuous integration

**Status: Agreed**

CI blocks merging when any required check fails. The intended pipeline includes:

- formatting and linting;
- TypeScript and C# compilation/type checks;
- frontend and backend unit/integration tests;
- production builds for both web applications and .NET deployables;
- OpenAPI snapshot and generated-client freshness;
- database migration validation;
- tenant-isolation contract tests;
- a focused Playwright smoke suite.

PostgreSQL integration coverage is added before PostgreSQL deployment support is
declared. Heavier cross-browser or exhaustive end-to-end suites may run on the
main branch or scheduled builds if pull-request latency becomes excessive.

## Local developer experience

**Status: Agreed**

A root command starts the member application, admin application, API, and
in-process background worker with SQLite and deterministic development personas.
Startup output prints each URL and important development-only links. Shutdown
stops the complete process group cleanly.

Individual applications and services remain independently runnable for focused
development and debugging. API client generation and stale-contract validation
have explicit commands.

## Containers

**Status: Deferred**

Docker images and Docker Compose are not required for the initial expansion.
The applications should use environment-based configuration and explicit
runtime boundaries so they can be containerized later without architectural
changes. PostgreSQL integration tests may introduce a targeted test container or
CI service when that provider enters active support.
