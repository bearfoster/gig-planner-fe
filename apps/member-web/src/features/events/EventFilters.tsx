import { Search, SlidersHorizontal, X } from "lucide-react";
import { useListVenues } from "@gig-planner/api-client/generated/venues/venues";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { useEventFilters } from "@/hooks/useEventFilters";

export function EventFilters() {
  const { filters, update, clear } = useEventFilters();
  const venues = useListVenues();
  return (
    <section
      aria-label="Event filters"
      className="mb-8 rounded-3xl border border-ink/10 bg-white p-4 shadow-sm sm:p-5"
    >
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          update({ search: filters.search });
        }}
      >
        <label className="relative flex-1">
          <span className="sr-only">Search artist or event</span>
          <Search className="absolute left-3 top-3 text-ink/40" size={18} />
          <Input
            value={filters.search ?? ""}
            onChange={(e) => update({ search: e.target.value })}
            className="pl-10"
            placeholder="Search artist or event…"
          />
        </label>
        <Button type="submit">Search</Button>
      </form>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
        <label>
          <span className="mb-1 block text-xs font-bold uppercase">Suburb</span>
          <Select
            value={filters.suburb ?? ""}
            onChange={(e) => update({ suburb: e.target.value })}
          >
            <option value="">All suburbs</option>
            {["Newtown", "Marrickville", "Darlinghurst", "Circular Quay"].map(
              (x) => (
                <option key={x}>{x}</option>
              ),
            )}
          </Select>
        </label>
        <label>
          <span className="mb-1 block text-xs font-bold uppercase">Venue</span>
          <Select
            value={filters.venueId ?? ""}
            onChange={(e) => update({ venueId: e.target.value })}
          >
            <option value="">All venues</option>
            {venues.data?.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </Select>
        </label>
        <label>
          <span className="mb-1 block text-xs font-bold uppercase">Genre</span>
          <Select
            value={filters.genre ?? ""}
            onChange={(e) => update({ genre: e.target.value })}
          >
            <option value="">All genres</option>
            {[
              "rock",
              "indie",
              "folk",
              "electronic",
              "jazz",
              "punk",
              "pop",
              "country",
            ].map((x) => (
              <option key={x} value={x}>
                {x[0].toUpperCase() + x.slice(1)}
              </option>
            ))}
          </Select>
        </label>
        <label>
          <span className="mb-1 block text-xs font-bold uppercase">
            Availability
          </span>
          <Select
            value={filters.status ?? ""}
            onChange={(e) => update({ status: e.target.value })}
          >
            <option value="">Any status</option>
            <option value="available">Available</option>
            <option value="limited">Limited</option>
            <option value="sold-out">Sold out</option>
          </Select>
        </label>
        <label>
          <span className="mb-1 block text-xs font-bold uppercase">
            From date
          </span>
          <Input
            type="date"
            value={filters.from?.slice(0, 10) ?? ""}
            onChange={(e) =>
              update({
                from: e.target.value ? `${e.target.value}T00:00:00.000Z` : "",
              })
            }
          />
        </label>
        <label>
          <span className="mb-1 block text-xs font-bold uppercase">Sort</span>
          <Select
            value={filters.sort ?? "date-asc"}
            onChange={(e) => update({ sort: e.target.value })}
          >
            <option value="date-asc">Soonest</option>
            <option value="date-desc">Latest</option>
            <option value="price-asc">Lowest price</option>
          </Select>
        </label>
      </div>
      <div className="mt-4 flex items-center justify-between text-sm text-ink/55">
        <span className="flex items-center gap-2">
          <SlidersHorizontal size={15} />
          Filters stay in the URL
        </span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            clear();
          }}
        >
          <X size={15} />
          Clear all
        </Button>
      </div>
    </section>
  );
}
