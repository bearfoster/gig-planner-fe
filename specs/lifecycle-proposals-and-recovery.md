# Lifecycle, proposals, and recovery

## Integration proposals

**Status: Agreed**

An integration may propose either a new event or changes to an existing event.
The proposal is a separate review resource; it is not the live event entity and
cannot have `published` status before approval.

When a proposal targets an existing published event, the published version
remains visible and unchanged while review is pending. Approval applies the
complete reviewed proposal atomically to that event. Members therefore see
either the old approved version or the complete new approved version, never a
partially applied edit.

Integrations may populate only core fields and active custom fields already
defined for the tenant. They cannot create, modify, archive, or delete custom
field definitions. Unmapped source data may be retained in a review note with
safe provenance metadata.

## Proposal review

**Status: Agreed**

An owner, administrator, or editor can:

- inspect the proposed content and its provenance;
- inspect deterministic possible-duplicate warnings;
- edit the complete proposal during review;
- approve and publish the reviewed result;
- reject the proposal with an optional reason.

Approval is holistic rather than field by field. The approved event reflects
the proposal as edited at the moment of approval. Approval records the reviewer,
time, proposal version, target event if any, and resulting event version in the
append-only audit trail.

Proposal edits and approval use optimistic concurrency. Approval must fail with
a conflict if the proposal or target event changed after the reviewer loaded
it. A rejected proposal is retained according to the eventual retention policy
rather than immediately erased.

## Deterministic duplicate detection

**Status: Agreed**

Duplicate detection runs inside the tenant boundary and does not require AI. It
uses:

1. exact source-system and external-identifier matches when supplied;
2. otherwise, a deterministic comparison of normalized title, start-time
   proximity, and matching Place.

The comparison produces candidate warnings rather than an automatic merge or
rejection. A reviewer decides whether to reject the proposal, merge it into an
existing draft, target an existing event update, or explicitly create a
separate event. Matching tolerances and normalization rules will be made
configurable code constants and covered by tests.

## Tenant deletion and restoration

**Status: Agreed**

Tenant deletion is recoverable for 30 days:

1. An owner initiates deletion after reauthentication and typing the tenant
   display name as confirmation.
2. The tenant is marked pending deletion and immediately disappears from
   ordinary member and tenant-admin access.
3. An owner can cancel pending deletion during the recovery period after
   reauthentication; a platform administrator can also restore it.
4. A background purge permanently deletes tenant-owned operational data after
   the recovery deadline.

Deletion initiation, audit entry, recovery deadline, and access revocation are
one transaction. Purge is asynchronous, retryable, and idempotent. Audit and
legal/security records that must outlive tenant data use non-content metadata
and follow a separately defined retention policy.

The deletion UI offers an optional “Export first” action but does not make
export completion a prerequisite. A platform administrator deleting another
tenant must also reauthenticate, type the tenant display name, and provide a
required audit reason.

## Leaving a tenant

**Status: Agreed**

A member may leave a tenant subject to these safeguards:

- the sole remaining owner must first promote another owner or delete the
  tenant;
- every shared plan they own must first be transferred to another current
  member, made private and deleted, or explicitly relinquished for deletion;
- private plans and favourites may be deleted as part of departure;
- collaborator grants held by the departing member are removed;
- departure invalidates membership and server-side active-tenant preferences
  atomically.

The UI must show blocking ownership and plan obligations before confirmation.
The API rechecks them transactionally to prevent races.

Plan transfer is immediate after explicit confirmation by the current owner.
The recipient must already be a current tenant member but does not accept a
separate pending transfer. The action is audited.

## Account deletion

**Status: Agreed**

An account cannot be deleted while it is the sole owner of any tenant. Shared
plans owned by the account must be transferred, deleted, or relinquished under
the same rules as tenant departure.

Initiating deletion immediately disables authentication and invalidates active
application sessions and user-owned credentials.

After the 14-day recovery deadline, account deletion:

- removes all tenant memberships and collaborator grants;
- deletes private plans, favourites, and user preferences;
- replaces required historical audit attribution with a non-identifying stable
  tombstone rather than erasing the audit event;
- removes or anonymizes other personal data according to a later retention and
  privacy policy.

Reauthentication and an explicit destructive-action confirmation are required.
Account deletion is recoverable for 14 days. Access is disabled immediately,
while memberships, plans, favourites, and other account state remain retained.
Recovery during that period reactivates the retained account state. Purge or
anonymization runs only after the recovery deadline and remains subject to the
agreed audit-retention rules.

## Invitation delivery

**Status: Agreed**

Invitations expire seven days after issue. Resending invalidates the previous
token and issues a new seven-day invitation. Tokens are stored as one-way
hashes, are single-use, and are never written to logs or audit metadata.

In production, creating or resending an invitation saves both the invitation
state and an outgoing-email record in one database transaction. A background
worker sends the email after commit and retries transient failures. Processing
is idempotent and supports inspection/replay of terminal failures. Email
delivery failure does not roll back the already-created invitation.

Development mode does not require an email provider and exposes the invitation
link to an authorized administrator for copying.
