# Phase 0B — backend foundation

## Objective

Evolve the backend into the agreed modular-monolith structure, establish
backend-owned OpenAPI and provider-neutral persistence/application boundaries,
and introduce the minimum tenant-aware schema foundation while preserving the
existing API behavior. Do not implement Phase 1 login or tenant workflows.

## Execution context

- Repository: `gig-planner-api-dotnet`
- Canonical specs: sibling `../gig-planner-fe/specs`
- Base branch: `codex/event-planner`
- Work branch: `codex/phase-0b-backend-foundation`
- Recommended model: GPT-5.6 Sol medium, or Terra high
- May run concurrently with: Phase 0A in the frontend repository

Read before editing:

- backend `AGENTS.md`
- `../gig-planner-fe/specs/backend-persistence-and-api.md`
- `../gig-planner-fe/specs/runtime-operations-and-quality.md`
- `../gig-planner-fe/specs/architecture-overview.md`
- `../gig-planner-fe/specs/migration-and-delivery.md`
- `../gig-planner-fe/specs/roadmap.md` — Phase 0
- `../gig-planner-fe/specs/traceability.md`

## Traceability

- `API-01`: make .NET-generated OpenAPI authoritative and reproducibly
  exportable for frontend consumption.
- `API-03`: enforce dependency direction through capability-specific ports;
  avoid EF Core and generic repositories outside infrastructure.
- `DB-01` (foundation): introduce Tenant and `TenantId` schema/relationship
  foundations for existing tenant-owned catalogue and personal records.
- `DB-02` (initial): keep SQLite working and document/test an evolution path
  compatible with future PostgreSQL support.
- `OPS-04` (foundation): establish OpenTelemetry-compatible API and worker
  instrumentation without selecting a telemetry vendor.
- `QA-02` (partial): build/test every backend project and verify exported
  OpenAPI/migrations in CI.
- `DX-01` (partial): keep the API runnable and provide a separately buildable
  Worker host; final cross-repository orchestration is integration work.
- `SEC-01`: preserve safe configuration and secret-free telemetry/errors.

## Owned changes

This goal exclusively owns the backend repository:

- solution and .NET project structure;
- Domain, Application, Infrastructure, Contracts, API, and Worker projects;
- dependency references and architecture enforcement tests;
- EF Core model, schema evolution mechanism, deterministic seed, and database
  initialization;
- backend OpenAPI generation/export and backend CI verification;
- API/worker OpenTelemetry foundations;
- backend tests and documentation affected by the restructure.

It must not edit the frontend repository or its checked-in/generated API client.

## Required implementation

1. Establish the project boundaries named in
   `runtime-operations-and-quality.md`, preserving capability-oriented folders
   within each project.
2. Move existing contracts, domain entities, application behavior, and EF Core
   infrastructure into their correct projects without changing public endpoint
   behavior unintentionally.
3. Replace API-layer database access with explicit application use cases and
   capability-specific persistence/query ports. Do not introduce a generic
   `IRepository<T>` or return `IQueryable` across the infrastructure boundary.
4. Define explicit transaction/unit-of-work composition usable by later tenant
   creation and membership slices. Do not add distributed transactions or a
   message broker.
5. Add the minimum Tenant entity and immutable `TenantId` relationships needed
   to assign all current tenant-owned data to the seeded Sydney tenant. Preserve
   stable existing identifiers where compatible.
6. Keep existing `/api/v1` routes working as a temporary single-tenant
   compatibility surface. Do not add the Phase 1 tenant-route contract or treat
   the compatibility tenant as an authorization solution.
7. Implement and test a deterministic SQLite schema creation/evolution path and
   seed verification. Keep provider-specific behavior isolated so PostgreSQL
   support remains viable; full PostgreSQL migrations are Phase 6.
8. Make .NET OpenAPI export reproducible through a documented command and keep
   a backend-owned snapshot or other deterministic artifact suitable for the
   Phase 0 integration handoff.
9. Add a separately buildable `GigPlanner.Worker` host and shared background
   processing composition seams, but do not implement outbox jobs scheduled for
   Phase 3.
10. Add OpenTelemetry-compatible tracing, metrics, and structured logging
    foundations for API and Worker. Use safe local defaults and no committed
    exporter secrets.
11. Add architecture/dependency tests and update contract/integration tests so
    the refactor cannot silently change the existing API.

## Explicitly out of scope

- Editing any frontend files or generated TypeScript.
- Development-token login, account creation, membership, tenant switching, or
  tenant-scoped routes from Phase 1.
- Platform administration, invitations, custom fields, collaborative plans,
  outbox processing, integration credentials, proposals, or MCP.
- Selecting a production identity, telemetry, email, storage, or broker vendor.
- Claiming production PostgreSQL support before its migrations/tests exist.

## Verification

At minimum:

- `dotnet restore`;
- full solution build;
- full unit, application, architecture, integration, and contract tests;
- clean-database schema/seed verification, including Sydney tenant assignment
  and preservation of current record counts/relationships;
- existing endpoint contract comparison, including Problem Details behavior;
- reproducible OpenAPI export repeated with no diff;
- Worker build and startup/health smoke behavior appropriate to an idle host;
- telemetry smoke verification without sensitive payloads;
- changed-file formatting and final dependency-boundary review.

## Completion criteria

- All projects compile with the intended dependency direction.
- Existing frontend-facing API behavior remains compatible.
- Existing data is deterministically assigned to the Sydney tenant.
- No API/application code exposes EF Core implementation types.
- OpenAPI is generated and owned by the backend with a clear frontend handoff.
- SQLite initialization/evolution and seed verification pass.
- Worker and OpenTelemetry foundations exist without premature Phase 3 logic.
- The final report lists commands run, results, residual risks, and the exact
  OpenAPI/startup handoff expected by the integration checkpoint.

## Goal prompt

```text
Implement Phase 0B exactly as specified in the canonical frontend document
../gig-planner-fe/specs/execution/phase-0b-backend-foundation.md. Treat both
repositories' AGENTS.md guidance and the linked specs as authoritative. Preserve
the existing HTTP contract and do not begin Phase 1 workflows. Continue until
every completion criterion and applicable verification check is satisfied, or
report a concrete blocker that cannot be resolved within the backend repository.
```
