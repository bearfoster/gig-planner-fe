# Event Planner agent guidance

## Scope and sources of truth

- This repository owns both frontend applications and the canonical product
  specifications under `specs/`.
- Read `specs/README.md`, the relevant phase in `specs/roadmap.md`, and the
  linked requirement IDs in `specs/traceability.md` before implementing a
  roadmap slice.
- The detailed capability specs are authoritative. The roadmap controls order;
  it does not override detailed behavior.
- Record an intentional product or architecture change in the relevant spec
  before implementing behavior that contradicts an agreed requirement.
- The sibling backend repository is normally `../gig-planner-api-dotnet`.
  Coordinate contract and cross-repository changes explicitly.

## Current and target layout

- The current member application is React 19, Vite, React Router, and TanStack
  Query under `src/`.
- The target frontend workspace is defined in
  `specs/applications-and-identity.md`: `apps/member-web`, `apps/admin-web`,
  `packages/api-client`, and a deliberately small `packages/ui`.
- Preserve the current member experience while migrating it incrementally.
  Do not move unrelated code merely to approximate the target layout early.
- The member application remains a client-rendered Vite SPA. The admin
  application uses Next.js App Router and meaningful Server/Client Component
  boundaries.
- Next.js and browser code call the .NET API; neither accesses the database or
  reimplements backend authorization and domain rules.

## API and state rules

- The .NET backend is the eventual OpenAPI source of truth. Generated files
  under `src/api/generated` or the future `packages/api-client` must never be
  edited manually.
- TanStack Query owns fetched server state. Keep page/filter state in URLs and
  local interaction state close to the component that owns it.
- Treat frontend route guards and hidden controls as UX only. The backend must
  enforce authentication, tenant access, roles, plan grants, and integration
  scopes.
- Tenant routes use immutable tenant GUIDs. Never infer authorization from a
  route, cached tenant preference, or client-supplied tenant identifier.
- Keep shared packages narrow. Do not make the Vite and Next.js applications
  share routing, rendering, or global state abstractions.

## Working method

- Implement roadmap work as vertical slices spanning contract, generated
  client, UI, telemetry, and tests where relevant.
- Before editing for a phase or substantial slice, read its entire execution
  plan under `specs/execution/`, including every referenced prerequisite. Create
  or update the plan first if it does not yet list applicable traceability IDs
  and measurable completion checks.
- Preserve unrelated working-tree changes. Inspect status before editing and
  stage only files belonging to the requested change.
- Use `rg`/`rg --files` for repository search and `apply_patch` for authored
  edits. Use formatting or generation commands for mechanical rewrites.
- Keep the initial visual system black, white, grey, and utilitarian as defined
  in `specs/migration-and-delivery.md`.

## Commands and verification

Current commands from the repository root:

```text
npm run dev
npm run dev:fullstack
npm run format:check
npm run lint
npm run typecheck
npm test
npm run test:e2e
npm run build
npm run api:generate
npm run api:check
```

Update this file when the npm-workspace migration changes canonical commands.
Run the narrowest relevant checks while iterating, then all checks required by
the phase and traceability entries before declaring completion. Cross-tenant
negative tests, OpenAPI/client freshness, production builds, and focused
Playwright journeys are release gates whenever the slice affects them.

## Definition of done

- Implemented behavior matches the detailed specs and permission matrix.
- Relevant happy paths, validation errors, role failures, and tenant-isolation
  failures are tested.
- Loading, empty, success, conflict, and safe error states are handled where the
  UI can encounter them.
- Generated API artifacts are current and were generated from the authoritative
  contract.
- Formatting, lint, type-check, applicable tests, and production builds pass.
- The final diff is reviewed for regressions, leaked secrets, unrelated edits,
  and accidental changes to generated files.
