import { Edit3, Plus, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import {
  getListEventsQueryKey,
  useDeleteEvent,
  useListEvents,
} from "@gig-planner/api-client/generated/events/events";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ErrorState, LoadingState } from "@/components/AsyncState";
import { formatGigDate } from "@/lib/utils";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export default function AdminEventsPage() {
  useDocumentTitle("Manage events");
  const client = useQueryClient();
  const query = useListEvents({ page: 1, pageSize: 50, sort: "date-asc" });
  const remove = useDeleteEvent({
    mutation: {
      onSuccess: () => {
        toast.success("Event deleted");
        void client.invalidateQueries({ queryKey: getListEventsQueryKey() });
      },
      onError: () => toast.error("Could not delete event"),
    },
  });
  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-sm font-bold uppercase tracking-[.2em] text-violet">
            Admin
          </p>
          <h1 className="mt-2 text-5xl font-bold">Manage events</h1>
        </div>
        <Button asChild>
          <Link to="/admin/events/new">
            <Plus size={17} />
            New event
          </Link>
        </Button>
      </header>
      {query.isLoading ? (
        <LoadingState />
      ) : query.isError ? (
        <ErrorState />
      ) : (
        <div className="overflow-x-auto rounded-3xl bg-white shadow-sm">
          <table className="w-full min-w-[700px] text-left">
            <thead>
              <tr className="border-b border-ink/10 text-xs uppercase tracking-wider text-ink/50">
                <th className="p-5">Event</th>
                <th className="p-5">Date</th>
                <th className="p-5">Venue</th>
                <th className="p-5">Status</th>
                <th className="p-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {query.data?.items.map((event) => (
                <tr
                  key={event.id}
                  className="border-b border-ink/8 last:border-0"
                >
                  <td className="p-5">
                    <div className="font-bold">{event.name}</div>
                    <div className="text-sm text-ink/50">
                      {event.artist.name}
                    </div>
                  </td>
                  <td className="p-5 text-sm">
                    {formatGigDate(event.startsAt)}
                  </td>
                  <td className="p-5 text-sm">{event.venue.name}</td>
                  <td className="p-5">
                    <span className="rounded-full bg-ink/6 px-3 py-1 text-xs font-bold uppercase">
                      {event.status}
                    </span>
                  </td>
                  <td className="p-5">
                    <div className="flex justify-end gap-2">
                      <Button asChild variant="ghost" size="icon">
                        <Link
                          to={`/admin/events/${event.id}/edit`}
                          aria-label={`Edit ${event.name}`}
                        >
                          <Edit3 size={17} />
                        </Link>
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Delete ${event.name}`}
                          >
                            <Trash2 size={17} />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogTitle className="pr-8 text-2xl font-bold">
                            Delete this event?
                          </DialogTitle>
                          <DialogDescription className="mt-3 text-ink/60">
                            This removes “{event.name}” from the in-memory mock
                            catalogue. You can reset mock data from your
                            profile.
                          </DialogDescription>
                          <div className="mt-6 flex justify-end">
                            <Button
                              variant="destructive"
                              disabled={remove.isPending}
                              onClick={() =>
                                remove.mutate({ eventId: event.id })
                              }
                            >
                              Delete event
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
