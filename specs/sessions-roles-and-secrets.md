# Sessions, role grants, and secrets

## Production sign-on and API access

**Status: Agreed direction**

Both web applications use OpenID Connect Authorization Code flow with PKCE
against the same standards-compatible identity provider. Each application has
its own secure application session. The identity provider's shared session
provides single sign-on, so moving between applications may involve a redirect
but does not require credentials again.

The .NET API accepts short-lived, audience-restricted access tokens and
validates issuer, audience, signature, lifetime, and subject. It does not accept
frontend-supplied roles or tenant identifiers as authorization claims.

The Next.js admin application keeps its application session and API tokens in
secure, HTTP-only, same-site cookies or equivalent server-side session storage,
allowing Server Components to call the API without exposing tokens to browser
JavaScript. Client-side mutations use a same-origin Next.js boundary or another
CSRF-protected mechanism that preserves the server-held session.

The Vite member SPA uses Authorization Code with PKCE and holds access tokens in
memory, not local storage. Silent renewal/refresh and logout propagation must
follow the selected provider's standards-supported flow without placing
long-lived bearer credentials in browser storage.

Detailed cookie scope, CSRF protections, refresh-token rotation, callback URLs,
and logout endpoints are implementation security decisions to threat-model once
the identity provider is selected.

## Development authentication

**Status: Agreed**

A development-only identity endpoint issues short-lived signed development
tokens for seeded or newly created test personas. The tokens use the same core
API authentication and subject-resolution path as production tokens wherever
practical. Tenant memberships and application roles continue to come from the
application database.

Development token issuance:

- is enabled only in an explicit development environment;
- cannot accept arbitrary role or platform-administrator claims from callers;
- selects server-defined seeded personas or creates an ordinary no-membership
  test account;
- uses separate signing material supplied through development configuration;
- is absent or fails closed in production builds and deployments.

The two local web applications can obtain their own development sessions for
the same persona without requiring repeated credential entry.

## Tenant role grants

**Status: Agreed**

- Owners can grant owner, administrator, editor, or member roles.
- Administrators can grant administrator, editor, or member roles.
- Editors and members cannot manage memberships or invitations.
- Only an owner can promote someone to owner or remove/demote another owner.
- The last owner cannot be removed or demoted.
- Tenant membership operations cannot grant platform-administrator access.

Granting, changing, or removing a role revalidates the acting user's current
role transactionally and creates an audit record.

## Platform-administrator grants

**Status: Agreed initially**

Platform-administrator identities are provisioned through controlled seed or
deployment configuration in the initial system. A future separately secured
platform operation may manage these grants, but ordinary tenant endpoints never
can.

Platform privilege is stored as application authorization data linked to an
identity account. It is not inferred from an email domain or accepted solely
from an untrusted frontend claim.

## Tenant naming and creation limits

**Status: Agreed**

Tenant display names do not need to be globally unique because routes use the
immutable tenant GUID. The UI may distinguish duplicate names with additional
context but the API does not reject them solely for duplication.

There is no initial product quota on how many tenants one account may create.
Standard rate limiting protects the creation endpoint against accidental or
automated bursts.

## Secrets and sensitive configuration

**Status: Agreed**

Secrets are never committed to either repository. Local development uses
environment variables, .NET user-secrets, or ignored developer configuration.
Production uses deployment-managed secret storage.

This includes identity signing keys and client secrets, database credentials,
email-provider credentials, telemetry exporter credentials, API-key material,
and any future object-storage or broker credentials. Repositories contain safe
examples listing required configuration names without usable secret values.

Secret values must not appear in application logs, traces, audit records, error
responses, generated exports, snapshots, or test fixtures. Rotation procedures
must be possible without recompiling an application.
