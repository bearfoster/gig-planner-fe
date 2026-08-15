# Phase 0 integration checkpoint

## Objective

Integrate the independently completed Phase 0A and Phase 0B results, make the
backend-owned OpenAPI contract drive the frontend client reproducibly, and prove
that both applications, the API, and the idle worker foundation operate together
without regressing the existing member experience.

This checkpoint starts only after both parallel goals report that their
independent completion criteria are satisfied.

## Execution context

- Repositories: both `gig-planner-fe` and `gig-planner-api-dotnet`
- Inputs: completed Phase 0A and Phase 0B branches
- Recommended model: GPT-5.6 Sol, medium reasoning
- Execution style: one integration owner; no concurrent structural edits

## Entry gate

Before integration:

- both goal worktrees are clean;
- both branches contain final verification reports in their goal/chat handoff;
- frontend workspace checks and backend solution checks pass independently;
- each branch documents its OpenAPI/startup handoff;
- no unresolved blocker changes an agreed specification.

## Integration ownership

The integration owner exclusively controls these choke points:

- backend OpenAPI export command and authoritative snapshot;
- frontend OpenAPI input/snapshot, Orval configuration, and generated client;
- root cross-repository development orchestration and port allocation;
- CI contract-freshness wiring;
- any small compatibility fix required at the HTTP boundary.

Do not continue Phase 1 feature work during this checkpoint.

## Required integration

1. Review both diffs against their execution plans and the Phase 0 roadmap.
2. Integrate Phase 0A into the frontend Event Planner branch and Phase 0B into
   the backend Event Planner branch using reviewable Git history.
3. Configure `packages/api-client` to generate from the backend-owned OpenAPI
   artifact. The frontend may keep a checked-in snapshot for reproducibility,
   but its refresh/check command must derive it from the backend source rather
   than maintaining a competing handwritten contract.
4. Regenerate the frontend client and resolve contract differences deliberately.
   Never hand-edit generated output to preserve obsolete behavior.
5. Make one root developer command start:
   - member web on its configured port;
   - admin web on a distinct configured port;
   - the API;
   - local in-process background hosting or the idle Worker mode selected by the
     Phase 0B handoff.
6. Preserve independent commands for each web application, API, and Worker.
7. Ensure CI can detect stale backend OpenAPI, stale frontend snapshot/client,
   failed migrations/schema verification, and failed builds/tests.
8. Review the combined solution for duplicated contracts, frontend business
   rules, cross-layer EF Core references, committed secrets, and accidental
   Phase 1 behavior.

## Full verification gate

Frontend:

- clean install from lockfile;
- format check with any pre-existing debt explicitly resolved or baselined;
- lint and type-check across workspaces;
- member and admin tests;
- member and admin production builds;
- existing member Playwright smoke suite;
- backend-contract snapshot and generated-client freshness checks.

Backend:

- restore and full solution build;
- full unit, architecture, integration, and contract tests;
- clean SQLite schema/seed verification;
- deterministic OpenAPI export;
- API and Worker startup/health smoke checks.

Combined:

- one-command startup from a clean local state;
- member application calls the real API with mocks disabled;
- existing catalogue, artist, venue, event, favourite, plan, and admin
  compatibility journeys behave as expected;
- admin Next.js shell loads independently;
- correlation/telemetry smoke evidence exists across the implemented boundary;
- both worktrees and integration branches are clean after generation/checks.

## Completion criteria

- Every Phase 0 roadmap outcome is either complete or explicitly identified as
  a Phase 1 item already placed there by the authoritative roadmap.
- `API-01`, `API-03`, `UI-01`, and Phase 0 portions of `DB-01`, `DB-02`,
  `OPS-04`, `QA-02`, `DX-01`, `UI-02`, and `SEC-01` have verification evidence.
- Existing Sydney Gig Planner behavior survives as the seeded compatibility
  experience.
- Both Event Planner branches are ready to serve as the base for Wave 1
  worktrees.

## Goal prompt

```text
Before editing, read this entire execution plan and every specification it
references. Then run the Phase 0 integration checkpoint exactly as specified in
specs/execution/phase-0-integration-checkpoint.md after verifying that Phase 0A
and 0B meet their independent entry gates. Treat specs/ and both AGENTS.md files
as authoritative. Own the cross-repository OpenAPI, generation, startup, and CI
choke points. Do not begin Phase 1. Continue until the combined verification gate
passes or report a concrete blocker with evidence.
```
