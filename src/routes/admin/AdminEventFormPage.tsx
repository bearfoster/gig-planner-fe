import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import {
  getListEventsQueryKey,
  useCreateEvent,
  useGetEvent,
  useUpdateEvent,
} from "@/api/generated/events/events";
import type { CreateEventRequest } from "@/api/generated/models";
import { ApiError } from "@/api/fetcher";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LoadingState, ErrorState } from "@/components/AsyncState";
import { EventForm } from "@/features/admin/EventForm";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export default function AdminEventFormPage() {
  const { eventId } = useParams();
  const editing = Boolean(eventId);
  useDocumentTitle(editing ? "Edit event" : "Create event");
  const navigate = useNavigate();
  const client = useQueryClient();
  const [apiErrors, setApiErrors] = useState<Record<string, string[]>>({});
  const eventQuery = useGetEvent(eventId ?? "", {
    query: { enabled: editing, retry: false },
  });
  const success = (message: string) => {
    toast.success(message);
    void client.invalidateQueries({ queryKey: getListEventsQueryKey() });
    navigate("/admin/events");
  };
  const failure = (error: ApiError) => {
    setApiErrors(error.problem.errors ?? {});
    toast.error(error.problem.detail);
  };
  const create = useCreateEvent<ApiError>({
    mutation: { onSuccess: () => success("Event created"), onError: failure },
  });
  const update = useUpdateEvent<ApiError>({
    mutation: { onSuccess: () => success("Event updated"), onError: failure },
  });
  const submit = (data: CreateEventRequest) => {
    setApiErrors({});
    if (eventId) update.mutate({ eventId, data });
    else create.mutate({ data });
  };
  if (editing && eventQuery.isLoading) return <LoadingState />;
  if (editing && (!eventQuery.data || eventQuery.isError))
    return (
      <div className="mx-auto max-w-3xl px-6 py-16">
        <ErrorState message="That event could not be loaded for editing." />
      </div>
    );
  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <Button asChild variant="ghost" className="mb-6">
        <Link to="/admin/events">
          <ArrowLeft size={16} />
          Back to events
        </Link>
      </Button>
      <header className="mb-8">
        <p className="text-sm font-bold uppercase tracking-[.2em] text-violet">
          Admin
        </p>
        <h1 className="mt-2 text-5xl font-bold">
          {editing ? "Edit event" : "Create event"}
        </h1>
      </header>
      <Card className="p-6 sm:p-8">
        <EventForm
          event={eventQuery.data}
          apiErrors={apiErrors}
          pending={create.isPending || update.isPending}
          onSubmit={submit}
        />
      </Card>
    </div>
  );
}
