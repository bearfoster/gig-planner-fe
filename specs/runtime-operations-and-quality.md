# Runtime, operations, and quality

## Backend solution structure

**Status: Agreed direction**

The backend evolves as a modular monolith with explicit projects:

```text
GigPlanner.Api             HTTP host and transport composition
GigPlanner.Application     use cases, ports, authorization orchestration
GigPlanner.Domain          entities, value objects, policies, invariants
GigPlanner.Infrastructure  EF Core and external-service adapters
GigPlanner.Worker          background-processing host
GigPlanner.Contracts       versioned public HTTP contract types where useful
```

Features are organized by business capability within these boundaries. The
project split is not permission to create generic catch-all layers or expose
domain internals through a shared library.

## Future service extraction

**Status: Agreed as an architectural constraint, not an implementation goal**

The first implementation remains a modular monolith. Capability-specific ports
and versioned contracts should make later extraction possible where operational
evidence justifies it. In-process modules must not depend on another module's EF
Core `DbSet`, infrastructure implementation, or internal entity types.

Potential service boundaries communicate through explicit application
interfaces today. If extracted later, those calls can become versioned HTTP or
message contracts. Transactions remain local to one current business action;
the design does not introduce distributed transactions or premature event
infrastructure merely to resemble microservices.

Candidate extraction boundaries will be reassessed after usage data exists.
Likely candidates include integration/MCP ingestion, notification delivery, and
long-running export processing rather than the core tenant catalogue itself.

## Worker hosting

**Status: Agreed**

Background handlers and the outbox implementation are shared infrastructure:

- local development can host the worker loop inside the API process;
- production runs `GigPlanner.Worker` as a separately deployable process;
- configuration prevents both hosts unintentionally processing jobs when local
  in-process mode is enabled;
- safe database job claiming permits deliberate horizontal scaling;
- API availability does not depend on email or purge work completing inline.

## Production identity compatibility

**Status: Agreed direction**

No external identity-provider vendor is selected yet. Production identity must
use standards-compatible OpenID Connect and OAuth 2.x flows. The API validates
issuer, audience, signature, lifetime, and required claims rather than trusting
frontend-supplied identity or roles.

Provider subject identifier plus issuer is the durable external identity key;
email is profile and invitation-matching data, not the primary account key.
Authorization roles and tenant memberships remain application data rather than
being delegated entirely to provider token claims.

The specific provider is deliberately deferred. The production session and token model is
defined in [Sessions, role grants, and secrets](./sessions-roles-and-secrets.md).

## Images

**Status: Agreed initially**

Tenant settings, Events, Participants, and Places use externally hosted image
URLs. File upload, object storage, image transformation, malware inspection,
and asset lifecycle management are outside the initial scope.

URLs are validated and rendered defensively. Allow-listing, remote-image proxy
behavior, and protections against server-side fetching of arbitrary URLs must
be decided before any backend image-fetch or Next.js image-optimization feature
is enabled.

## Timezones

**Status: Agreed**

Tenant timezones use canonical IANA identifiers such as `Australia/Sydney`.
Tenant administrators choose from a searchable supported list. Date/time entry
is interpreted in the tenant timezone and persisted as an unambiguous instant;
responses include enough timezone context for correct display.

Daylight-saving gaps and ambiguous local times must produce explicit UI/API
handling rather than silently selecting an unintended instant.

## Tenant suspension

**Status: Agreed**

Platform administrators can suspend and unsuspend a tenant. Suspension blocks
ordinary member access, tenant administration, integration API keys, MCP calls,
and background actions that would publish or notify on the tenant's behalf.
It retains tenant data and does not start deletion retention.

Platform administrators can inspect a suspended tenant, record a reason, lift
the suspension, or initiate the separately safeguarded deletion workflow. The
status change and reason are audited. In-flight requests recheck status at the
authoritative use-case boundary.

Affected users see only a generic “This tenant is currently unavailable” state.
The recorded suspension reason is visible only in platform administration.

## Tenant data export

**Status: Agreed at the capability level**

Tenant owners can request an asynchronous JSON export. The export includes
tenant settings, catalogue data, custom-field definitions and values,
memberships, plans and sharing grants, and proposal history.

It excludes member email addresses, external identity identifiers,
authentication secrets, API-key hashes, invitation tokens, internal security
data, and platform-wide audit records. Export generation is a versioned,
retryable background job. The resulting download is access-controlled,
auditable, and available only to an authorized owner for 24 hours, after which
the file is deleted.

Export bytes are stored through an `IExportStorage` port. Local development uses
an ignored local-filesystem adapter. Production will use object storage through
the same port when a provider is selected. Downloads require current owner
authorization rather than relying solely on knowledge of a URL, and storage
cleanup is idempotent. Export schema versioning remains to be defined with the
concrete export contract during that vertical slice.

## Observability

**Status: Agreed**

All deployable processes use OpenTelemetry-compatible instrumentation. The
minimum operational surface includes:

- structured logs with safe, queryable fields;
- correlation and trace context propagated across browser/API, API/worker,
  MCP/API, and external calls where supported;
- liveness and readiness health checks;
- HTTP duration, throughput, and error metrics;
- authentication, authorization, and rate-limit outcome metrics without
  sensitive identifiers;
- outbox depth, oldest-job age, processing duration, retry, and terminal-failure
  metrics;
- proposal creation/review operational metrics;
- traces around application use cases, database calls, and background handlers.

Audit records and observability telemetry serve different purposes. Logs and
traces do not replace the durable application audit trail and must not contain
tokens, raw API keys, invitation links, or unnecessarily identifying content.
Exporter/backend selection and retention are deployment decisions.

## Tenant-isolation verification

**Status: Agreed and mandatory**

Every tenant-owned capability includes automated negative authorization tests.
Reusable contract fixtures prove that an actor from tenant A cannot use known
identifiers to read, mutate, relate, approve, export, or infer tenant B data.

Coverage includes at least:

- catalogue entities and list/search filters;
- custom-field definitions and values;
- plans, entries, and collaborator grants;
- invitations and membership administration;
- proposals and approval;
- integration API keys and MCP-facing endpoints;
- exports and background job ownership;
- platform-administrator exceptions and their auditing.

Tests cover absent membership, insufficient role, stale membership, suspended
tenant, cross-tenant foreign keys, and enumeration-resistant not-found/forbidden
behavior. These tests are release gates.

## Accessibility and responsive design

**Status: Deferred as formal acceptance criteria**

WCAG conformance and defined responsive breakpoints are not initial release
gates. Implementation should still preserve sensible semantic HTML, labels,
keyboard-operable native controls, and the existing application's usable
behavior where this does not add significant scope. A dedicated accessibility
and responsive-design specification can be added in a later phase.
