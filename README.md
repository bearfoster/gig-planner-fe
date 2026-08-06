# Sydney Gig Planner

A polished React single-page application for discovering fictional live music events around Sydney, saving favourites and assembling a personal weekend plan. It includes artist and venue directories, event details, notes, a mock profile and a role-gated event administration area.

All dates, prices, ticket links and event details are deterministic fictional demonstration data.

## Architecture

- React 19, TypeScript and Vite; client-rendered only.
- React Router with lazy route modules.
- OpenAPI 3.1 as the frontend/backend source of truth.
- Orval-generated DTOs, Fetch client and TanStack Query hooks in `src/api/generated`. **Never edit generated files manually.**
- TanStack Query for API/server state; URL search parameters for catalogue state; local React state for UI details; Context only for mock authentication.
- MSW intercepts actual Fetch requests in development and tests. Page components never import fixture data.
- Tailwind CSS with accessible shadcn-style Radix primitives, React Hook Form and Zod.

More rationale is in [docs/architecture.md](docs/architecture.md).

## Prerequisites and installation

Use Node.js 22 or newer and npm 10 or newer.

```bash
npm install
npm run api:generate
npm run dev
```

Vite prints the local URL. Development uses `.env.development`, which enables the mock API by default.

## Commands

| Command                | Purpose                                              |
| ---------------------- | ---------------------------------------------------- |
| `npm run dev`          | Start the development server                         |
| `npm run build`        | Type-check and create a production build             |
| `npm run preview`      | Preview the production build                         |
| `npm run lint`         | Run ESLint                                           |
| `npm run typecheck`    | Run TypeScript without emitting files                |
| `npm test`             | Run Vitest component/integration tests               |
| `npm run test:watch`   | Run Vitest in watch mode                             |
| `npm run test:e2e`     | Run Playwright smoke journeys                        |
| `npm run api:generate` | Generate the client from OpenAPI                     |
| `npm run api:check`    | Regenerate and fail if the existing output was stale |

Install Playwright’s browser once before the first E2E run:

```bash
npx playwright install chromium
```

## OpenAPI workflow

The contract is `openapi/sydney-gig-planner.yaml`. Edit that file first, then run `npm run api:generate`. Orval configuration lives in `orval.config.ts`; set `OPENAPI_INPUT` to a backend contract URL or another file when generating against a different source:

```bash
OPENAPI_INPUT=https://api.example.com/openapi/v1.json npm run api:generate
```

`api:check` snapshots the generated directory, runs generation and compares the output without requiring Git. It is suitable for CI after generated files are committed to a future repository.

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
