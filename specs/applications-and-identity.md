# Applications and identity

## Frontend applications

**Status: Agreed**

The frontend is an npm workspace containing two independently runnable and
deployable web applications:

```text
apps/
  member-web/       Vite, React Router, and TanStack Query
  admin-web/        Next.js App Router
packages/
  api-client/       generated API contracts and clients
  ui/               deliberately shared primitives and design tokens
```

The current React application moves into `apps/member-web`. Its embedded admin
routes move to `apps/admin-web` and are removed from the member application once
the replacement is complete. Shared packages must not couple the applications'
routing, rendering, or state-management strategies.

The ASP.NET Core backend remains in its sibling repository. Both web
applications communicate with it through the versioned HTTP API; neither reads
the database directly.

## Deployment and routes

**Status: Agreed conceptually; production hostnames configurable**

The intended production shape is:

- member application: `https://app.example.com/{tenantId}/...`;
- tenant administration: `https://admin.example.com/{tenantId}/...`;
- platform administration: `https://admin.example.com/platform/...`.

`tenantId` is an immutable GUID. Tenant display-name changes never invalidate a
route. The applications run on separate local-development ports.

Actual domains are deployment configuration rather than compiled product
constants.

## Rendering approaches

**Status: Agreed**

The member application remains a client-rendered Vite SPA. React Router owns
navigation and TanStack Query owns API-backed server state.

The admin application uses Next.js App Router, nested layouts, Server
Components, and server-side initial data loading where appropriate. Interactive
forms and mutations use Client Components and call the authoritative .NET API.
Next.js does not become a second domain backend and does not access the database
directly.

This intentional difference makes the applications useful as a comparison of
regular React SPA and Next.js rendering/composition patterns.

## Shared sign-on

**Status: Agreed at the experience level**

One authenticated identity works across the member and admin applications. A
user who has signed in can navigate between the applications without entering
credentials again. The eventual external identity provider is shared by both
applications and the API.

Authentication proves account identity. Authorization remains in the .NET API,
which loads platform privileges, tenant membership, and tenant role for every
protected use case.

The agreed production token/session direction is defined in
[Sessions, role grants, and secrets](./sessions-roles-and-secrets.md). Provider-
specific callback, refresh, and logout details are resolved during the selected
provider's threat-model and implementation work.

## Development login

**Status: Agreed**

Development mode provides a login page that can:

- select a seeded persona covering important role and membership combinations;
- create a simple test account without a password;
- establish a real development authentication session shared by both web
  applications;
- allow the API to resolve memberships and enforce normal authorization rules.

Development login must be explicitly disabled outside development. It replaces
the current caller-controlled role header: callers cannot gain a role merely by
sending an arbitrary role value.

Seeded personas should include at least a platform administrator, tenant owner,
tenant administrator, editor, member, multi-tenant member, and account with no
tenant memberships.

## Invitation identity binding

**Status: Agreed**

An invitation is bound to a normalized email address. It can be accepted only
by an authenticated account whose verified email matches that address.
Development accounts treat the email selected or entered during development
login as verified.

Email comparison and normalization rules must be explicitly defined during
implementation; the system must not rely on provider-specific transformations
that could merge distinct real-world addresses.

## Tenant selection and preferences

**Status: Agreed**

Each application provides a tenant switcher. The user's last active tenant is a
server-side preference persisted in the database, keyed by user and application
type. This allows the preference to follow the user across browsers and permits
the member and admin applications to remember different working contexts.

The browser may cache the preference for responsive navigation, but it is not
an authorization input. On application entry, the API validates that the user
still has access to the stored tenant:

1. If it is valid, the application navigates to that tenant.
2. If it is absent or no longer valid, the application presents the accessible
   tenant list.
3. If there are no accessible tenants, the member application offers tenant
   creation or invitation acceptance. The admin application presents an
   appropriate no-access state.

Platform administrators may enter the platform-administration area without a
tenant selection.

## Membership departure and ownership

**Status: Agreed**

- A tenant may have multiple owners.
- An owner may promote an existing member to owner.
- A member may leave a tenant voluntarily.
- The last remaining owner cannot leave without first promoting another owner
  or deleting the tenant.
- Removing or leaving a tenant immediately invalidates access even if a stale
  tenant route or browser-cached preference remains.

The behavior of plans owned by a departing member is defined in
[Lifecycle, proposals, and recovery](./lifecycle-proposals-and-recovery.md).
