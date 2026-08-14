# Domain and collaboration requirements

## Access invariant

**Status: Agreed**

All tenant data is private. A request may access tenant catalogue, plan,
membership, or configuration data only when its authenticated actor has an
active membership in that tenant or is a platform administrator.

The API is authoritative for this rule. Frontend route guards and hidden UI are
usability features, not security controls. Tenant context supplied in a path,
header, token, or request body must be validated against the authenticated
actor on every operation.

## Core catalogue model

**Status: Agreed direction; names accepted**

Each tenant owns an isolated catalogue made from these core concepts:

- **Event:** something a member may discover and add to a plan.
- **Participant:** a person, group, production, film, speaker, artist, or other
  featured subject associated with an event.
- **Place:** a physical or online location such as a venue, restaurant, church,
  cinema, meeting point, or URL.

A tenant may customize the user-facing plural and singular labels for
Participant and Place in a future release. Terminology customization is not
required in the first release.

Participant and Place records are tenant-owned; there is no cross-tenant global
directory. Every Event, Participant, and Place identifier must be validated in
the same tenant boundary when relationships are created or changed.

## Event core fields

**Status: Agreed, with detailed defaults selected during specification**

All events use a stable core schema so that browsing, filtering, planning, and
integrations work consistently across tenants.

Required fields:

- title;
- start date and time;
- lifecycle status;
- publication status.

Optional fields:

- description;
- end date and time;
- one Place;
- zero or more Participants;
- tenant-defined category and tags;
- image URL;
- numeric price and currency;
- human-readable cost description, for cases numeric price cannot represent;
- booking or information URL;
- availability status;
- featured flag, defaulting to false.

The event's start and end values are interpreted using the tenant timezone when
entered, and stored as unambiguous instants. When present, the end must not
precede the start. Publication, lifecycle, and availability values are defined
in [Events, custom fields, and plans](./events-custom-fields-and-plans.md).

## Custom fields

**Status: Agreed at the capability level**

Tenant administrators can define additional fields for events. Examples include
movie runtime and rating, cuisine and dietary options, or service type.

Custom-field definitions and values belong to one tenant. The API validates
values against the definition before saving them. Deleting or changing a field
definition must not silently corrupt existing event values.

Supported field types, filtering, and definition-change rules are defined in
[Events, custom fields, and plans](./events-custom-fields-and-plans.md).

## Plans and sharing

**Status: Agreed at the capability level**

- A plan belongs to one tenant and has one member as its owner.
- A plan contains tenant events and may include plan-specific notes.
- The owner can grant another current member either viewer or editor access.
- Viewers can read the shared plan but cannot change it.
- Editors can change plan contents but cannot transfer ownership or alter access
  unless a later requirement explicitly grants that permission.
- Plans cannot contain events from another tenant.
- Plans have no anonymous public links in the initial release.

Plan structure and simultaneous-edit behavior are defined in
[Events, custom fields, and plans](./events-custom-fields-and-plans.md).

## Tenant invitations

**Status: Agreed at the workflow level**

- A tenant owner or administrator invites an email address and selects the
  tenant role to grant.
- Invitations expire and can be revoked or resent before acceptance.
- Accepting an invitation associates the authenticated account with the tenant.
- An invitation cannot grant platform-administrator status.
- Development mode may expose a copyable invitation link instead of delivering
  email.

Invitations expire after seven days. Resending produces a new token and
invalidates the previous token. Inviting an existing member returns a conflict
and never changes their role implicitly. If the email already has a pending
invitation, the API returns that state; an administrator must explicitly resend
to replace it and restart the expiry period. Acceptance always requires a matching verified email as specified in
[Applications and identity](./applications-and-identity.md). Owners and
administrators may invite within the role-grant limits defined in
[Sessions, role grants, and secrets](./sessions-roles-and-secrets.md); editors
cannot manage invitations.

## Initial tenant role permissions

**Status: Agreed**

- **Owner:** all tenant operations, including ownership transfer and tenant
  deletion.
- **Administrator:** tenant settings, membership, invitations, and all catalogue
  content.
- **Editor:** Event, Participant, and Place content, including approval of
  AI-generated content.
- **Member:** browse tenant content, maintain favourites, create plans, and share
  owned plans.

Destructive operations and ownership transfer require more detailed safeguards
in a later specification. The API must enforce role policies per use case rather
than relying only on broad route-level role checks.

A tenant can have multiple owners. An owner can promote an existing member to
owner. The sole remaining owner cannot leave the tenant until they promote a
replacement owner or delete the tenant. Other members may leave voluntarily.

## Platform administration

**Status: Agreed at the capability level**

Platform administrators can inspect and directly modify any tenant without
becoming a tenant member. Their cross-tenant operations must be distinguishable
from normal tenant-member operations and included in the audit trail.

Platform administrators cannot impersonate users. Before deleting a tenant they
must reauthenticate, type the tenant display name, and supply an audit reason.

## AI-assisted catalogue updates

**Status: Agreed at the workflow level**

AI or MCP-originated create and update operations never publish immediately.
They create a draft or proposed revision within one tenant. A tenant editor,
administrator, or owner reviews and explicitly approves that draft before it
becomes published catalogue content.

The draft must retain provenance sufficient to identify the integration,
request actor or credential, creation time, source references where available,
and approving user. Detailed proposal behavior is defined in
[Lifecycle, proposals, and recovery](./lifecycle-proposals-and-recovery.md).
