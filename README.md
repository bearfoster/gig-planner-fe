# Event Planner frontend workspace

This npm workspace contains the preserved Sydney Gig Planner member SPA and a
separately runnable Event Planner admin shell.

All dates, prices, ticket links and event details are deterministic fictional demonstration data.

## Applications

- `apps/member-web`: existing Vite, React Router, and TanStack Query SPA. Its
  temporary `/admin` routes remain available until Phase 1 feature parity.
- `apps/admin-web`: Next.js App Router administrative shell. It contains no
  authentication, tenant selection, or administration workflows in Phase 0A.
- `packages/api-client`: the sole home for Orval-generated models and clients.
- `packages/ui`: intentionally small shared design tokens used by both apps.

## Architecture

- React 19, TypeScript and Vite; client-rendered only.
- React Router with lazy route modules.
- OpenAPI 3.1 as the frontend/backend source of truth.
- Orval-generated DTOs, Fetch client and TanStack Query hooks in `packages/api-client/src/generated`. **Never edit generated files manually.**
- TanStack Query for API/server state; URL search parameters for catalogue state; local React state for UI details; Context only for mock authentication.
- MSW intercepts actual Fetch requests in development and tests. Page components never import fixture data.
- Tailwind CSS with accessible shadcn-style Radix primitives, React Hook Form and Zod.

More rationale is in [docs/architecture.md](docs/architecture.md).

## Prerequisites and installation

Use Node.js 22 or newer and npm 10 or newer.

```bash
npm install
npm run dev
```

Vite prints the local URL. Development uses `.env.development`, which enables the mock API by default.

## Commands

| Command                 | Purpose                                            |
| ----------------------- | -------------------------------------------------- |
| `npm run dev`           | Start member and admin web applications            |
| `npm run dev:member`    | Start only the Vite member application (port 5173) |
| `npm run dev:admin`     | Start only the Next.js admin shell (port 3000)     |
| `npm run dev:fullstack` | Start both web applications and sibling .NET API   |
| `npm run build`         | Type-check and build every emitting workspace      |
| `npm run lint`          | Run ESLint                                         |
| `npm run typecheck`     | Run TypeScript without emitting files              |
| `npm test`              | Run Vitest component/integration tests             |
| `npm run test:watch`    | Run Vitest in watch mode                           |
| `npm run test:e2e`      | Run Playwright smoke journeys                      |
| `npm run test:e2e:real` | Run the same journeys against a fresh real API     |
| `npm run api:generate`  | Generate the client from the checked-in snapshot   |
| `npm run api:refresh`   | Export backend OpenAPI, copy it, and regenerate    |
| `npm run api:check`     | Verify backend, snapshot, and client freshness     |

`dev:fullstack` expects `gig-planner-api-dotnet` beside this repository, starts
the API and idle Worker, then member web on port 5173 and admin web on 3000. It
stops the complete process group. Override `GIG_PLANNER_BACKEND_DIR`,
`GIG_PLANNER_API_PORT`, `GIG_PLANNER_MEMBER_PORT`, or
`GIG_PLANNER_ADMIN_PORT` when needed.

Install Playwright’s browser once before the first E2E run:

```bash
npx playwright install chromium
```

## OpenAPI workflow

The .NET-owned contract is `../gig-planner-api-dotnet/openapi/gig-planner-v1.json`.
The frontend keeps an exact checked-in copy at
`packages/api-client/openapi/gig-planner-v1.json` so installs and builds remain
reproducible. Run `npm run api:refresh` after a backend contract change; it runs
the backend exporter, copies that artifact, and regenerates the client. Set
`GIG_PLANNER_BACKEND_DIR` when the backend is not in the default sibling path.

Orval configuration lives in `packages/api-client/orval.config.ts`. The lower-
level generation command can accept another input for diagnostics:

```bash
OPENAPI_INPUT=https://api.example.com/openapi/v1.json npm run api:generate
```

`api:check` first verifies deterministic backend export, compares the frontend
snapshot byte-for-byte with the backend artifact, then regenerates and compares
the client without relying on Git. CI checks out the coordinated backend
integration branch and runs this same command.

## Mock API and authentication

`VITE_ENABLE_MOCK_API=true` starts the browser MSW worker. Set it to `false` or omit it to exclude the worker startup and let Fetch reach the configured API. The deterministic fixtures, reusable handlers and browser-session in-memory datastore are in `src/mocks`.

The Profile page exposes development-only controls to switch between `user` and `admin`, plus a **Reset mock data** button. Reloading also starts a fresh in-memory store. Error handlers support standard Problem Details responses, including deliberate `400`, `403`, `404` and `500` paths.

## Connect a real backend

Build with mocks disabled and set the API origin:

```bash
VITE_ENABLE_MOCK_API=false VITE_API_BASE_URL=https://api.example.com npm run build
```

The backend must implement the `/api/v1` contract and allow the frontend origin through CORS. Components and query hooks need no rewrite. Replace the demonstration role header/auth provider when real authentication is introduced.

## Testing

Vitest uses the same MSW handlers as browser development and covers catalogue loading, filter/search URL state, details and 404s, optimistic favourites, weekend planning, form validation, successful admin creation, API validation errors and route-level 404 handling. Playwright covers the four primary end-to-end journeys requested in the product brief.

## Production SPA routing

The production host must serve `index.html` for every route that is not a real static asset. Examples: an Nginx `try_files $uri $uri/ /index.html;` rule, a Netlify `_redirects` entry of `/* /index.html 200`, or an equivalent rewrite on the selected static host. Without fallback routing, direct visits such as `/events/<id>` will return a host-level 404.

## Future backend responsibilities

A real backend remains authoritative for authentication, role-based authorisation, validation, durable persistence, uniqueness and concurrency control, audit history, secure ticket links, rate limiting and safe error reporting. Frontend route guards and Zod validation improve user experience but are not security boundaries.
