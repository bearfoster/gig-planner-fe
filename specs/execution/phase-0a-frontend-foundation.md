# Phase 0A — frontend foundation

## Objective

Convert the frontend into the agreed npm workspace, preserve the existing Vite
member application, and establish a separately runnable Next.js admin shell and
shared-package boundaries. Do not begin tenant functionality in this goal.

## Execution context

- Repository: `gig-planner-fe`
- Base branch: `codex/multi-tenant-specs`
- Work branch: `codex/phase-0a-frontend-foundation`
- Recommended model: GPT-5.6 Terra, medium reasoning
- May run concurrently with: Phase 0B in the backend repository

Read before editing:

- `AGENTS.md`
- `specs/applications-and-identity.md`
- `specs/migration-and-delivery.md`
- `specs/architecture-overview.md`
- `specs/roadmap.md` — Phase 0
- `specs/traceability.md`

## Traceability

- `UI-01`: establish the Vite member and Next.js admin application boundaries.
- `UI-02`: apply the monochrome, utilitarian foundation to the new admin shell;
  preserve the current member UI during the structural move.
- `API-01` (partial): establish `packages/api-client` generation and freshness
  commands using the current checked-in contract as a temporary input.
- `QA-02` (partial): make root checks build and test every frontend workspace.
- `DX-01` (partial): provide root commands for both web applications; final
  API/worker orchestration is completed at the integration checkpoint.
- `SEC-01`: do not introduce committed secrets or unsafe example values.

## Owned changes

This goal exclusively owns frontend-repository structural changes:

- root npm workspace configuration, scripts, and lockfile;
- `apps/member-web` and the mechanical move of the current Vite application;
- `apps/admin-web` Next.js App Router scaffold;
- `packages/api-client` packaging and generation commands;
- `packages/ui` only for primitives or tokens used by both applications;
- frontend ESLint, TypeScript, Vitest, Playwright, Prettier, and build
  configuration needed by the workspace;
- frontend CI changes required to verify the new workspace;
- frontend developer documentation affected by changed commands.

No other concurrent goal may edit these files.

## Required implementation

1. Configure an npm workspace with `apps/*` and `packages/*`.
2. Move the existing Vite application into `apps/member-web` while preserving
   routes, generated-client behavior, MSW, component tests, Playwright journeys,
   static assets, and production SPA fallback expectations.
3. Scaffold `apps/admin-web` with Next.js App Router, TypeScript, and a minimal
   black/white/grey administrative shell. Use Server Components by default and
   add Client Components only where interaction requires them.
4. Make the admin application independently runnable and buildable. It does not
   implement real authentication, tenant selection, or migrated admin features
   in Phase 0A.
5. Establish `packages/api-client` as the only future home of generated API
   models and clients. During parallel execution it may generate from the
   current frontend OpenAPI snapshot; the integration checkpoint switches it to
   the backend-owned snapshot.
6. Establish `packages/ui` only if at least one real primitive or token is used
   by both applications. Do not move application-specific routing, state, page,
   or framework code into it merely to populate the package.
7. Provide root scripts for install, development, lint, type-check, tests,
   builds, formatting, API generation, and API freshness. Preserve a focused
   member-only development command.
8. Update the existing full-stack script or replace it with workspace-aware
   orchestration without assuming Phase 0B files that do not yet exist.
9. Keep the embedded member-app `/admin` routes working during this phase; their
   removal waits for Next.js feature parity in Phase 1.

## Explicitly out of scope

- Editing the sibling backend repository.
- Defining or changing tenant, membership, role, or authentication contracts.
- Removing existing React admin routes.
- Rebuilding the member application visual design.
- Implementing database, worker, MCP, integration, or production identity code.
- Manually editing generated API files.

## Verification

At minimum:

- clean workspace installation from the committed lockfile;
- member lint, type-check, component/integration tests, and production build;
- admin lint, type-check, tests appropriate to the scaffold, and production
  build;
- shared-package type-check/build where packages emit output;
- existing Playwright smoke journeys against the moved member application;
- API generation and stale-output check using the temporary contract input;
- one command starts both web applications on distinct configured ports;
- changed-file formatting and repository diff review.

Record any pre-existing unrelated failing check separately; do not reformat or
rewrite unrelated files solely to make the move appear clean.

## Completion criteria

- Existing member behavior and tests survive the move.
- `apps/admin-web` renders its minimal shell and builds independently.
- Workspace scripts work from the repository root.
- Generated API code has one package boundary and no manual edits.
- No tenant behavior or backend contract invention has entered the branch.
- The final report lists commands run, results, residual risks, and the exact
  backend handoff expected by the integration checkpoint.

## Goal prompt

```text
Before editing, read this entire execution plan and every document under “Read
before editing.” Then implement Phase 0A exactly as specified in
specs/execution/phase-0a-frontend-foundation.md. Treat specs/ and AGENTS.md as
authoritative. Preserve existing member behavior and do not begin tenant or
backend work. Continue until every completion criterion and applicable
verification check is satisfied, or report a concrete blocker that cannot be
resolved within this repository.
```
