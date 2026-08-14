# Backend, persistence, and API

## Backend authority and boundaries

**Status: Agreed**

The ASP.NET Core API is the authoritative boundary for durable data,
authentication context, authorization, tenant isolation, validation, workflows,
and audit records. Both frontend applications and future integrations invoke
the same application use cases through HTTP.

The intended backend dependency direction is:

```text
HTTP endpoint/controller
  -> application use case
    -> domain model and policies
      -> capability-specific repository and service ports
        -> EF Core and other infrastructure adapters
```

HTTP, EF Core, a specific database provider, frontend concerns, and MCP do not
belong in the domain model.

## Tenant storage model

**Status: Agreed**

All tenants use one shared database and schema. Every tenant-owned entity
contains an immutable `TenantId`. Platform-wide records, such as user identity
and platform-administrator grants, are explicitly distinguished from
tenant-owned records.

Tenant isolation is defense in depth:

- every tenant repository operation requires an explicit tenant context;
- foreign keys and unique indexes include tenant identity where needed to
  prevent cross-tenant relationships and collisions;
- application authorization verifies the actor can access the tenant;
- EF Core query filters may provide an additional safeguard but are not the sole
  protection;
- tests attempt cross-tenant reads and writes for every tenant-owned capability.

A tenant identifier supplied by a client is never accepted as proof of access.

## Persistence abstraction

**Status: Agreed**

Application use cases depend on capability-specific ports such as event,
membership, plan, and audit repositories plus an explicit unit-of-work or
transaction boundary. The design does not use a generic `IRepository<T>` that
reduces business operations to generic CRUD.

EF Core implements the persistence ports. Repository methods express use-case
needs and return domain/application representations rather than exposing
`DbSet`, `IQueryable`, tracking entities, or provider types outside
infrastructure.

One business action uses the smallest transaction that keeps its state,
invariants, concurrency version, idempotency record, and required audit record
consistent.

## Database providers and migrations

**Status: Agreed direction**

- SQLite is the initial local-development and learning database.
- PostgreSQL is the intended first production-grade provider.
- Domain and application layers remain provider-neutral.
- Provider-specific migrations may be maintained when schema evolution or SQL
  differences require them.
- Automated persistence tests run against SQLite initially and should add
  PostgreSQL coverage before PostgreSQL is considered supported for deployment.

The existing optional SQL Server provider need not define future design
decisions or receive equal migration/test support unless it is explicitly
restored to scope.

## OpenAPI contract ownership

**Status: Agreed**

The .NET API owns and generates the OpenAPI contract. The frontend workspace
generates its shared API client and TypeScript models from that contract. A
checked-in OpenAPI snapshot allows reproducible frontend builds and contract
review without requiring a running backend.

CI must detect when the checked-in contract or generated frontend client is
stale. Frontend code must not manually edit generated client files.

## HTTP resource structure

**Status: Agreed conceptually**

The versioned API uses these resource families:

```text
/api/v1/me/...
/api/v1/tenants/{tenantId}/events/...
/api/v1/tenants/{tenantId}/participants/...
/api/v1/tenants/{tenantId}/places/...
/api/v1/tenants/{tenantId}/plans/...
/api/v1/tenants/{tenantId}/members/...
/api/v1/platform/tenants/...
```

Tenant settings, invitations, custom-field definitions, categories, audit
records, and integration credentials are nested under the tenant resource.
Concrete endpoint methods and representations will be defined in the API
contract.

URLs represent resources and scope, not a calling UI. Authorization policies
are based on actor, tenant role, credential scopes, and business operation; an
endpoint does not become privileged merely because it is called by the admin
application.

## Integration service accounts and API keys

**Status: Agreed**

Initial external integrations authenticate as tenant-scoped service accounts
using revocable and rotatable API keys. A displayed key secret is available only
at creation; durable storage contains a one-way hash and safe identifier.

Each service account has explicit scopes. Initial integration scopes should be
limited to the reads necessary to construct proposals and a proposal-write
scope. Integration credentials cannot publish, approve their own proposals,
manage tenant membership, or perform platform administration.

Credential creation, scope changes, rotation, last-use metadata, and revocation
are restricted to tenant owners and administrators and produce audit records.
Transport requires HTTPS outside local development.

## Integration idempotency

**Status: Agreed**

Integration write requests require an idempotency key scoped to the service
account and operation. The backend stores the key, normalized request identity,
outcome, and retention metadata in the same transaction as the resulting draft
or proposal.

Retrying an identical request returns the original outcome. Reusing a key with
a materially different request returns a conflict. Records are retained for 30
days initially.

## Audit trail

**Status: Agreed**

The system keeps an append-only application audit trail for:

- tenant creation and settings changes;
- membership and invitation actions;
- role and ownership changes;
- published catalogue changes;
- proposal approval and rejection;
- integration service-account and credential lifecycle actions;
- integration-originated operations;
- cross-tenant platform-administrator operations.

Each record includes timestamp, action, actor type and identifier, tenant when
applicable, target type and identifier, correlation/trace identifier, and safe
change metadata. Secrets and sensitive authentication material must never be
recorded. Normal application behavior cannot update or delete audit entries.

Audit export and future redaction obligations are deferred policy topics.
Unsuccessful authentication and authorization attempts go to structured
security logs and metrics rather than the application audit table; repeated or
high-risk patterns can trigger operational alerts.

## MCP delivery order

**Status: Agreed**

MCP tools and security expectations are specified before implementation. The
MCP server is implemented only after the tenant-aware API, integration service
accounts, proposal workflow, and approval UI provide a stable boundary for it
to call.

The MCP server is an adapter and orchestration surface, not an alternate data
or authorization layer.

## Duplicate proposal detection

**Status: Agreed**

The recommended initial approach is deterministic and tenant-scoped. Proposal
ingestion compares exact external source identifiers where present and a
combination of normalized title, start-time proximity, and Place. The backend
returns possible existing events or drafts for human review.

Duplicate detection warns rather than automatically merges or rejects. An
authorized reviewer decides whether to reject the proposal, merge it into an
existing draft, or continue creating a separate event. AI-based semantic
similarity may later add a clearly labelled hint but is not an authoritative or
required part of the workflow.
