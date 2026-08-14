# Events, custom fields, and plans

## Event status dimensions

**Status: Agreed**

The event model separates three concerns rather than combining them into one
ambiguous status:

- **Publication status:** `draft`, `published`, or `archived`.
- **Lifecycle status:** `scheduled`, `postponed`, `cancelled`, or `completed`.
- **Availability status:** `available`, `limited`, `sold-out`, or `unavailable`.

Only published events appear in the member catalogue by default. Archived
events are retained for administration and historical plan integrity. Cancelled,
completed, sold-out, and unavailable published events remain visible unless a
user filters them out; their status must be apparent in the UI.

Archival is terminal for that Event identifier. An archived event cannot be
restored; an editor creates a new Event if equivalent content is needed again.
Other allowed status transitions will be documented with the API contract.

## Human and integration publishing

**Status: Agreed**

Tenant owners, administrators, and editors can save event content as a draft or
publish it immediately. Immediate publication is the default action in the
human admin UI, with save-as-draft available as an explicit alternative.

Create or update proposals authenticated with an external integration or MCP
credential cannot publish directly. They must enter the draft approval workflow described in
[Domain and collaboration requirements](./domain-and-collaboration.md).

Calls made by the admin application on behalf of an authenticated human retain
that person's publish permission; using HTTP does not by itself force the
approval workflow.

## One-off events

**Status: Agreed**

Events are one-offs in the initial product. Recurrence rules and recurring
series are out of scope. The admin UI may offer duplication as a convenience,
but each duplicate is an independent event with its own identifier and state.

## Custom-field types

**Status: Agreed**

The first release supports these event custom-field types:

- short text;
- long text;
- integer;
- decimal number;
- yes/no;
- date;
- single-select;
- multi-select;
- URL.

Each definition has a stable identifier, tenant, display name, type,
required/optional setting, display order, active/archived state, and optional
filter configuration. Select definitions also own ordered option identifiers
and labels. Stored event values reference stable definition and option
identifiers rather than mutable display labels.

## Changing custom-field definitions

**Status: Agreed**

- A definition's display name and display order can change without changing its
  identity.
- A definition with stored values cannot change type.
- Removing a used definition archives it. Historical values remain intact, and
  the field disappears from new forms and ordinary catalogue views.
- To replace a used field with a different type, an administrator archives the
  old definition and creates a new definition with a new identifier.
- A definition with no stored values may be permanently deleted.

Option-removal behavior for select fields must follow the same preservation
principle: existing historical values must not silently become meaningless.

## Custom-field filtering

**Status: Agreed**

An administrator can mark a suitable definition as filterable. Initial filter
behavior is:

- exact value for yes/no and single-select fields;
- contains-any selected option for multi-select fields;
- minimum/maximum ranges for integer, decimal, and date fields;
- no structured filtering for short text, long text, or URL fields.

Filter definitions are tenant-scoped, and filter inputs must be validated
against the current active field definition.

## Categories and tags

**Status: Agreed**

An event can have zero or one tenant-managed category and zero or more
free-form tags. Categories have stable tenant-scoped identifiers and
administrator-managed names. Tags are normalized within a tenant to avoid
duplicates caused only by case or surrounding whitespace.

## Plan structure

**Status: Agreed**

A plan contains:

- a required name;
- an optional description;
- optional start and end dates;
- an ordered collection of event entries;
- an optional plan-specific note on each entry;
- one owner;
- zero or more viewer/editor collaborator grants;
- a concurrency version.

If both plan dates exist, the end cannot precede the start. Plan dates describe
the plan rather than restricting its contents; the UI may warn when an event
falls outside the range, but the API does not reject it solely for that reason.
Every event and collaborator must belong to the same tenant as the plan.

The former weekend plan becomes a normal named plan with a weekend date range
during migration.

## Plan collaboration

**Status: Agreed**

- Owners manage plan access and can edit plan content.
- Editor collaborators can change plan metadata, entry ordering, and entry
  notes.
- Viewer collaborators have read-only access.
- Comments and collaboration notifications are outside the first release.

Plan writes use optimistic concurrency. A client submits the version it read.
If the stored version has changed, the API returns a conflict and current
version information rather than overwriting another collaborator's work. The
UI prompts the user to refresh and reconcile their changes.
