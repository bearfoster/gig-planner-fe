import { useSearchParams } from "react-router-dom";
import type { ListEventsParams } from "@gig-planner/api-client/generated/models";

export function useEventFilters() {
  const [params, setParams] = useSearchParams();
  const filters = {
    search: params.get("search") || undefined,
    suburb: params.get("suburb") || undefined,
    venueId: params.get("venueId") || undefined,
    genre: params.get("genre") || undefined,
    status: params.get("status") || undefined,
    from: params.get("from") || undefined,
    to: params.get("to") || undefined,
    page: Number(params.get("page") || 1),
    pageSize: 9,
    sort: (params.get("sort") as ListEventsParams["sort"]) || "date-asc",
  };
  const update = (
    values: Partial<
      Record<keyof ListEventsParams, string | number | undefined>
    >,
  ) =>
    setParams(
      (current) => {
        const next = new URLSearchParams(current);
        Object.entries(values).forEach(([key, value]) => {
          if (value === undefined || value === "") next.delete(key);
          else next.set(key, String(value));
        });
        if (!("page" in values)) next.delete("page");
        return next;
      },
      { replace: false },
    );
  const clear = () => setParams({});
  return { filters, update, clear };
}
