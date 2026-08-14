# MCP, security, and background work

## MCP service boundary

**Status: Agreed**

The MCP server is a separately runnable and deployable .NET service. It exposes
MCP tools to compatible AI clients and calls the planner's ordinary versioned
HTTP API using a tenant-scoped integration service account.

The MCP service does not reference the EF Core infrastructure or connect to the
database. It does not implement independent authorization or business rules;
the API validates its credential, scopes, tenant access, proposal input,
idempotency key, and rate limits.

Using an OpenAI model is not required by the MCP server itself. An AI client may
use OpenAI or another compatible model while invoking the server's MCP tools.

## Initial MCP tools

**Status: Agreed**

The initial tool surface can:

- list tenants accessible to the integration credential;
- read a tenant's event schema and active custom-field definitions;
- search or list Events, Participants, and Places;
- retrieve one Event;
- propose a new Event;
- propose changes to an existing Event;
- retrieve proposal status.

It cannot publish content, approve or reject proposals, administer membership,
manage integration credentials, or change custom-field definitions. Tool names,
inputs, outputs, pagination, and error shapes will mirror stable API concepts
and be specified before MCP implementation.

## Proposal provenance

**Status: Agreed**

Every integration proposal requires at least one source reference, normally a
URL with an optional source-system name and external identifier. It may also
include concise review notes.

The system retains normalized provenance needed for review, duplicate checks,
and auditing. It does not retain whole scraped pages by default. Source content
is untrusted input and must not be rendered as executable markup or treated as
instructions by the API or admin application.

## Platform-administrator access

**Status: Agreed**

Platform administrators cannot impersonate users. They inspect and modify
tenants under their own authenticated identity. Every cross-tenant platform
operation is attributable to that administrator in the audit trail.

## Audit retention

**Status: Agreed initially**

Application audit records are retained for three months. The duration is
configuration with a three-month default. Expired entries are purged by an
idempotent background job.

Audit entries contain safe action metadata and exclude secrets, tokens, raw API
keys, whole source pages, and unnecessary personal or catalogue content.
Security/infrastructure logs may have a separate operational retention policy.

## Background processing

**Status: Agreed initial architecture**

The initial system uses an ASP.NET hosted worker and a transactional database
outbox. The API writes the business change and an outbox job in one transaction.
The worker polls for available jobs, claims them safely, performs the external
or delayed work, and records success or retry state. Local development can run
the worker inside the API process for convenience. Production deploys the same
handlers in a separate Worker process so API and background workloads can be
operated and scaled independently.

Initial background responsibilities include:

- invitation email delivery;
- permanent tenant purge after its recovery period;
- account purge/anonymization after its recovery period;
- expired audit-record purge;
- other small scheduled lifecycle jobs added explicitly later.

Handlers are idempotent because a process can fail after performing work but
before recording success. Jobs use bounded retries with backoff. Terminally
failed jobs remain inspectable and replayable. Multiple worker instances must
claim work without processing the same row concurrently, while still assuming
that duplicate delivery is possible.

No external message broker is required initially. Background-work ports and job
payload versions should avoid coupling application use cases to polling so a
broker can be introduced later without changing domain behavior.

## API-key lifecycle

**Status: Agreed**

An integration API key has:

- a required human-readable name;
- a non-secret identifier and displayed prefix;
- tenant and service-account ownership;
- explicit scopes;
- creation and last-used timestamps;
- an optional expiry timestamp;
- rotation and immediate revocation support.

Only the initial key secret is displayed. The backend stores a one-way hash.
Expired or revoked keys fail authentication, and key use updates last-used
metadata without placing the secret in logs.

## Rate limiting

**Status: Agreed at the policy level**

The API applies independently configurable policies:

- generous per-user limits for ordinary human-driven traffic;
- lower per-key write limits for integrations;
- request-rate and daily-volume limits for proposal creation;
- effectively disabled limits in local development.

Limits return a standard `429` Problem Details response and a retry hint where
meaningful. Exact thresholds are deployment configuration and will be chosen
with load tests and operational experience rather than embedded as domain
rules.
