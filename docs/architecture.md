# Architecture decisions

## Vite SPA, not Next.js

Sydney Gig Planner is an interaction-heavy client application with no server-rendering requirement. Vite provides a small, direct React 19 toolchain without coupling the future backend to a Node framework. React Router owns browser routing and production hosts must serve `index.html` for unknown application paths.

## Server, navigation, local and cross-cutting state

TanStack Query owns HTTP-backed server state, caching, refetching and mutation lifecycle. Search, filters, sort and pagination live in URL search parameters so links are shareable and browser back/forward restores the catalogue view. Component-only state uses `useState`; React Context is limited to the cross-cutting current-user/role experience. API responses are never copied into Context or another global store.

## OpenAPI is the boundary

`openapi/sydney-gig-planner.yaml` is the language-neutral contract between this frontend and any future backend. Orval derives TypeScript models, Fetch requests and TanStack Query hooks from it. Generated files under `src/api/generated` carry a generated warning and must never be edited manually; contract changes are made in YAML and regenerated.

## Network-level mocks

MSW intercepts the same Fetch calls a real backend will receive. Fixtures and the mutable in-memory mock store are backend concerns under `src/mocks`, never page imports. Turning mocks off makes the authored and generated API layers call the configured real API without component changes.

## Authorisation boundary

The admin route guard and role switcher are demonstration UX only. A future backend must authenticate every request and enforce role-based authorisation independently.
