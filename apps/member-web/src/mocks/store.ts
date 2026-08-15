import type {
  EventDto as Event,
  FavouriteDto as Favourite,
  WeekendPlanEntryDto as WeekendPlanEntry,
} from "@gig-planner/api-client/generated/models";
import { eventFixtures } from "./fixtures";

let events: Event[] = structuredClone(eventFixtures);
let favourites: Favourite[] = [];
const planEntries = new Map<string, WeekendPlanEntry[]>();

export const mockStore = {
  get events() {
    return events;
  },
  set events(value: Event[]) {
    events = value;
  },
  get favourites() {
    return favourites;
  },
  set favourites(value: Favourite[]) {
    favourites = value;
  },
  entries(weekend: string) {
    return planEntries.get(weekend) ?? [];
  },
  setEntries(weekend: string, value: WeekendPlanEntry[]) {
    planEntries.set(weekend, value);
  },
  reset() {
    events = structuredClone(eventFixtures);
    favourites = [];
    planEntries.clear();
  },
};
