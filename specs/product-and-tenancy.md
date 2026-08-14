# Product and tenancy requirements

The platform product name is **Event Planner**. Tenant display names describe
the particular guide or planning community hosted within it.

## Product direction

**Status: Agreed**

The product will become a general event-planning platform rather than remain a
Sydney-specific gig planner. Example tenants could independently operate a gig
guide, movie guide, food planner, church-visit planner, or another
event-oriented experience.

The existing product is the first example configuration, not the permanent
domain boundary.

## Tenant model

**Status: Agreed**

A tenant is an isolated organization or workspace. For example, "Mark's Gig
Guide" and "Jeff's Movie Guide" are separate tenants with separate content,
administrators, and members.

- A tenant can have multiple administrators and ordinary members.
- A user can belong to multiple tenants.
- A user can switch their active tenant inside the application.
- Tenant-facing routes use a single domain per application with an immutable,
  path-based tenant identifier.
- Every tenant owns its own events and related directory data, including its
  own artists/subjects and venues/locations.
- Tenant data must not be readable or writable by another tenant except through
  an explicitly authorized platform-administration operation.

Tenant routes use the tenant's immutable GUID rather than its editable display
name or a mutable slug.

## Tenant customization

**Status: Agreed for the first release**

Each tenant can configure:

- its display name;
- its timezone.

The architecture should allow future branding and terminology customization,
but those capabilities are outside the initial scope unless added by a later
decision.

## Membership and sharing

**Status: Agreed at the product level**

- People join tenants through invitations.
- Tenant members can share event/show plans with other members as viewers or
  collaborators.
- Anonymous public read-only plan links are not required.
- Tenant catalogues and their contents require authentication and tenant
  membership; they are not anonymously browsable.

## Roles

**Status: Agreed at the role-category level**

- **Platform administrator:** manages the platform across all tenants.
- **Tenant owner:** has ultimate responsibility for one tenant, including its
  membership and settings.
- **Tenant administrator:** administers a tenant without being its owner.
- **Editor:** manages tenant event and directory content.
- **Member:** uses tenant content and maintains personal plans and favourites.

A person's role is contextual. The same account can hold different roles in
different tenants. Platform-administrator status is platform-wide rather than
a tenant membership role.

There is no public-visitor product role in the initial release because tenant
catalogues and plans require authentication and membership.

## Tenant creation

**Status: Agreed at the product level**

Any authenticated user can create a tenant and becomes that tenant's initial
owner. Platform-administrator involvement is not required.

## Applications

**Status: Agreed at the boundary level**

The system will contain two independently runnable and deployable frontend
applications backed by the same authoritative API and data source:

1. A regular React SPA using Vite, React Router, TanStack Query, and the existing
   frontend approach for browsing and member planning.
2. A Next.js admin application for both platform administrators and tenant
   owners/administrators/editors, with capabilities determined by their role
   and active tenant context.

The current embedded React `/admin` functionality will move to the Next.js
application rather than remain duplicated in the regular SPA.

## Authentication

**Status: Agreed direction; implementation details open**

- The target architecture should support an external identity provider.
- The first development phase will use a development login experience.
- Authentication identifies the person; backend authorization determines
  platform privileges, tenant memberships, active tenant access, and permitted
  operations.

The development login must exercise real application authorization and tenant
isolation rules. It must not make frontend route guards the security boundary.

## API and AI-tool integration

**Status: Agreed direction; scope open**

The backend will expose an explicit, versioned API used by both frontend
applications. It should also support future external automation that can add or
update tenant information.

An MCP server is a planned integration adapter over the backend's application
API. It must use the same authorization policies, tenant scoping, validation,
and audit mechanisms as interactive administration. MCP tools must not access
the database directly or bypass business use cases.

Future AI-assisted workflows may discover relevant events externally and
propose updates to a tenant's content. AI-created or AI-modified content must be
saved as a draft and approved by an authorized tenant editor before publication.

## Deliberately deferred selections

Product discovery does not select a production identity-provider vendor,
telemetry backend, email provider, or object-storage provider. Their required
standards and boundaries are specified elsewhere in this specification set.
