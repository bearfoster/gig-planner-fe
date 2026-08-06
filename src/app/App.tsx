import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./AppLayout";
import { AdminGuard } from "./RouteGuard";
const HomePage = lazy(() => import("@/routes/HomePage"));
const EventsPage = lazy(() => import("@/routes/EventsPage"));
const EventDetailsPage = lazy(() => import("@/routes/EventDetailsPage"));
const ArtistsPage = lazy(() => import("@/routes/ArtistsPage"));
const ArtistDetailsPage = lazy(() => import("@/routes/ArtistDetailsPage"));
const VenuesPage = lazy(() => import("@/routes/VenuesPage"));
const VenueDetailsPage = lazy(() => import("@/routes/VenueDetailsPage"));
const FavouritesPage = lazy(() => import("@/routes/FavouritesPage"));
const WeekendPage = lazy(() => import("@/routes/WeekendPage"));
const ProfilePage = lazy(() => import("@/routes/ProfilePage"));
const AdminEventsPage = lazy(() => import("@/routes/admin/AdminEventsPage"));
const AdminEventFormPage = lazy(() => import("@/routes/admin/AdminEventFormPage"),);
const NotFoundPage = lazy(() => import("@/routes/NotFoundPage"));
export function App() {
  return (
    <Suspense
      fallback={
        <div className="grid min-h-[60vh] place-items-center">
          <div
            className="size-10 animate-spin rounded-full border-4 border-ink/15 border-t-violet"
            aria-label="Loading page"
          />
        </div>
      }
    >
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<HomePage />} />
          <Route path="events" element={<EventsPage />} />
          <Route path="events/:eventId" element={<EventDetailsPage />} />
          <Route path="artists" element={<ArtistsPage />} />
          <Route path="artists/:artistId" element={<ArtistDetailsPage />} />
          <Route path="venues" element={<VenuesPage />} />
          <Route path="venues/:venueId" element={<VenueDetailsPage />} />
          <Route path="favourites" element={<FavouritesPage />} />
          <Route path="weekend" element={<WeekendPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="admin" element={<AdminGuard />}>
            <Route index element={<Navigate to="events" replace />} />
            <Route path="events" element={<AdminEventsPage />} />
            <Route path="events/new" element={<AdminEventFormPage />} />
            <Route path="events/:eventId/edit" element={<AdminEventFormPage />} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
