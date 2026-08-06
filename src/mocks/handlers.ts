import { delay, http, HttpResponse } from "msw";
import type {
  CreateEventRequest,
  Event,
  EventSummary,
  ProblemDetails,
} from "@/api/generated/models";
import { artistFixtures, venueFixtures } from "./fixtures";
import { mockStore } from "./store";

const base = "*/api/v1";
const latency = () => delay(import.meta.env.MODE === "test" ? 0 : 350);
const problem = (
  status: number,
  title: string,
  detail: string,
  errors?: Record<string, string[]>,
) =>
  HttpResponse.json<ProblemDetails>(
    { type: "about:blank", title, status, detail, errors },
    { status, headers: { "Content-Type": "application/problem+json" } },
  );
const summary = (event: Event): EventSummary => event;
const isAdmin = (request: Request) =>
  request.headers.get("X-Mock-Role") === "admin";

export const handlers = [
  http.get(`${base}/events`, async ({ request }) => {
    await latency();
    const url = new URL(request.url);
    if (url.searchParams.get("search") === "__500")
      return problem(
        500,
        "Mock server error",
        "A deliberate mock error was requested.",
      );
    const q = (url.searchParams.get("search") ?? "").toLowerCase();
    const suburb = url.searchParams.get("suburb");
    const venueId = url.searchParams.get("venueId");
    const artistId = url.searchParams.get("artistId");
    const genre = url.searchParams.get("genre");
    const status = url.searchParams.get("status");
    const from = url.searchParams.get("from");
    const to = url.searchParams.get("to");
    const sort = url.searchParams.get("sort") ?? "date-asc";
    const page = Math.max(1, Number(url.searchParams.get("page") ?? 1));
    const pageSize = Math.min(
      50,
      Math.max(1, Number(url.searchParams.get("pageSize") ?? 9)),
    );
    let items = mockStore.events.filter(
      (item) =>
        (!q || `${item.name} ${item.artist.name}`.toLowerCase().includes(q)) &&
        (!suburb || item.venue.suburb === suburb) &&
        (!venueId || item.venue.id === venueId) &&
        (!artistId || item.artist.id === artistId) &&
        (!genre || item.genre === genre) &&
        (!status || item.status === status) &&
        (!from || item.startsAt >= from) &&
        (!to || item.startsAt <= to),
    );
    items.sort((a, b) =>
      sort === "date-desc"
        ? b.startsAt.localeCompare(a.startsAt)
        : sort === "price-asc"
          ? (a.price ?? 0) - (b.price ?? 0)
          : a.startsAt.localeCompare(b.startsAt),
    );
    const totalItems = items.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    items = items.slice((page - 1) * pageSize, page * pageSize);
    return HttpResponse.json({
      items: items.map(summary),
      page,
      pageSize,
      totalItems,
      totalPages,
    });
  }),
  http.get(`${base}/events/:eventId`, async ({ params }) => {
    await latency();
    const item = mockStore.events.find((event) => event.id === params.eventId);
    return item
      ? HttpResponse.json(item)
      : problem(
          404,
          "Event not found",
          "That gig may have been removed or the link is incorrect.",
        );
  }),
  http.post(`${base}/events`, async ({ request }) => {
    await latency();
    if (!isAdmin(request))
      return problem(
        403,
        "Admin access required",
        "Switch to the admin role to manage events.",
      );
    const body = (await request.json()) as CreateEventRequest;
    const errors: Record<string, string[]> = {};
    if (!body.name || body.name.length < 3)
      errors.name = ["Name must contain at least 3 characters."];
    if (body.name?.toLowerCase().includes("reject"))
      errors.name = ["The mock API rejected this event name."];
    const artist = artistFixtures.find((item) => item.id === body.artistId);
    const venue = venueFixtures.find((item) => item.id === body.venueId);
    if (!artist) errors.artistId = ["Choose a valid artist."];
    if (!venue) errors.venueId = ["Choose a valid venue."];
    if (Object.keys(errors).length)
      return problem(
        400,
        "Validation failed",
        "One or more fields are invalid.",
        errors,
      );
    const created: Event = {
      ...body,
      ticketUrl: body.ticketUrl ?? null,
      id: crypto.randomUUID(),
      artist: artist!,
      venue: venue!,
      featured: body.featured ?? false,
    };
    mockStore.events = [...mockStore.events, created];
    return HttpResponse.json(created, { status: 201 });
  }),
  http.put(`${base}/events/:eventId`, async ({ params, request }) => {
    await latency();
    if (!isAdmin(request))
      return problem(
        403,
        "Admin access required",
        "Switch to the admin role to manage events.",
      );
    const current = mockStore.events.find(
      (event) => event.id === params.eventId,
    );
    if (!current)
      return problem(404, "Event not found", "The event no longer exists.");
    const body = (await request.json()) as CreateEventRequest;
    const artist = artistFixtures.find((a) => a.id === body.artistId);
    const venue = venueFixtures.find((v) => v.id === body.venueId);
    if (!artist || !venue)
      return problem(
        400,
        "Validation failed",
        "Choose a valid artist and venue.",
      );
    const updated: Event = {
      ...body,
      ticketUrl: body.ticketUrl ?? null,
      id: current.id,
      artist,
      venue,
      featured: body.featured ?? false,
    };
    mockStore.events = mockStore.events.map((event) =>
      event.id === current.id ? updated : event,
    );
    return HttpResponse.json(updated);
  }),
  http.delete(`${base}/events/:eventId`, async ({ params, request }) => {
    await latency();
    if (!isAdmin(request))
      return problem(
        403,
        "Admin access required",
        "Switch to the admin role to manage events.",
      );
    if (!mockStore.events.some((e) => e.id === params.eventId))
      return problem(404, "Event not found", "The event no longer exists.");
    mockStore.events = mockStore.events.filter((e) => e.id !== params.eventId);
    return new HttpResponse(null, { status: 204 });
  }),
  http.get(`${base}/artists`, async () => {
    await latency();
    return HttpResponse.json(artistFixtures);
  }),
  http.get(`${base}/artists/:artistId`, async ({ params }) => {
    await latency();
    const item = artistFixtures.find((a) => a.id === params.artistId);
    return item
      ? HttpResponse.json(item)
      : problem(404, "Artist not found", "That artist could not be found.");
  }),
  http.get(`${base}/artists/:artistId/events`, async ({ params }) => {
    await latency();
    if (!artistFixtures.some((a) => a.id === params.artistId))
      return problem(
        404,
        "Artist not found",
        "That artist could not be found.",
      );
    return HttpResponse.json(
      mockStore.events
        .filter((e) => e.artist.id === params.artistId)
        .map(summary),
    );
  }),
  http.get(`${base}/venues`, async () => {
    await latency();
    return HttpResponse.json(venueFixtures);
  }),
  http.get(`${base}/venues/:venueId`, async ({ params }) => {
    await latency();
    const item = venueFixtures.find((v) => v.id === params.venueId);
    return item
      ? HttpResponse.json(item)
      : problem(404, "Venue not found", "That venue could not be found.");
  }),
  http.get(`${base}/venues/:venueId/events`, async ({ params }) => {
    await latency();
    if (!venueFixtures.some((v) => v.id === params.venueId))
      return problem(404, "Venue not found", "That venue could not be found.");
    return HttpResponse.json(
      mockStore.events
        .filter((e) => e.venue.id === params.venueId)
        .map(summary),
    );
  }),
  http.get(`${base}/me`, async ({ request }) => {
    await latency();
    const admin = isAdmin(request);
    return HttpResponse.json({
      id: "99999999-9999-4999-8999-999999999999",
      name: "Alex Chen",
      email: "alex.chen@example.test",
      avatarUrl: null,
      initials: "AC",
      roles: admin ? ["user", "admin"] : ["user"],
    });
  }),
  http.get(`${base}/me/favourites`, async () => {
    await latency();
    return HttpResponse.json(mockStore.favourites);
  }),
  http.post(`${base}/me/favourites`, async ({ request }) => {
    await latency();
    const { eventId } = (await request.json()) as { eventId: string };
    const item = mockStore.events.find((e) => e.id === eventId);
    if (!item)
      return problem(404, "Event not found", "The event no longer exists.");
    const favourite = {
      eventId,
      createdAt: new Date().toISOString(),
      event: summary(item),
    };
    mockStore.favourites = [
      ...mockStore.favourites.filter((f) => f.eventId !== eventId),
      favourite,
    ];
    return HttpResponse.json(favourite, { status: 201 });
  }),
  http.delete(`${base}/me/favourites/:eventId`, async ({ params }) => {
    await latency();
    if (!mockStore.favourites.some((f) => f.eventId === params.eventId))
      return problem(
        404,
        "Favourite not found",
        "The event is not in your favourites.",
      );
    mockStore.favourites = mockStore.favourites.filter(
      (f) => f.eventId !== params.eventId,
    );
    return new HttpResponse(null, { status: 204 });
  }),
  http.get(`${base}/me/plans/:weekend`, async ({ params }) => {
    await latency();
    return HttpResponse.json({
      weekend: params.weekend,
      entries: mockStore.entries(String(params.weekend)),
    });
  }),
  http.post(`${base}/me/plans/:weekend/events`, async ({ params, request }) => {
    await latency();
    const body = (await request.json()) as { eventId: string; note?: string };
    const item = mockStore.events.find((e) => e.id === body.eventId);
    if (!item)
      return problem(404, "Event not found", "The event no longer exists.");
    const entry = {
      eventId: item.id,
      note: body.note ?? "",
      event: summary(item),
    };
    const weekend = String(params.weekend);
    mockStore.setEntries(weekend, [
      ...mockStore.entries(weekend).filter((e) => e.eventId !== item.id),
      entry,
    ]);
    return HttpResponse.json(entry, { status: 201 });
  }),
  http.patch(
    `${base}/me/plans/:weekend/events/:eventId`,
    async ({ params, request }) => {
      await latency();
      const weekend = String(params.weekend);
      const entries = mockStore.entries(weekend);
      const current = entries.find((e) => e.eventId === params.eventId);
      if (!current)
        return problem(
          404,
          "Plan entry not found",
          "That event is not in this plan.",
        );
      const { note } = (await request.json()) as { note: string };
      const updated = { ...current, note };
      mockStore.setEntries(
        weekend,
        entries.map((e) => (e.eventId === current.eventId ? updated : e)),
      );
      return HttpResponse.json(updated);
    },
  ),
  http.delete(
    `${base}/me/plans/:weekend/events/:eventId`,
    async ({ params }) => {
      await latency();
      const weekend = String(params.weekend);
      if (!mockStore.entries(weekend).some((e) => e.eventId === params.eventId))
        return problem(
          404,
          "Plan entry not found",
          "That event is not in this plan.",
        );
      mockStore.setEntries(
        weekend,
        mockStore.entries(weekend).filter((e) => e.eventId !== params.eventId),
      );
      return new HttpResponse(null, { status: 204 });
    },
  ),
  http.post(`${base}/mock/reset`, async () => {
    mockStore.reset();
    return new HttpResponse(null, { status: 204 });
  }),
];
