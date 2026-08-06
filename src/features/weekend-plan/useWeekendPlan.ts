import { useQueryClient } from "@tanstack/react-query";
import type { EventSummary, WeekendPlan } from "@/api/generated/models";
import {
  getGetWeekendPlanQueryKey,
  useAddWeekendPlanEntry,
  useGetWeekendPlan,
  useRemoveWeekendPlanEntry,
  useUpdateWeekendPlanEntry,
} from "@/api/generated/weekend-plans/weekend-plans";
import { currentWeekend } from "@/lib/utils";
import { toast } from "sonner";

export function useWeekendPlan(weekend = currentWeekend()) {
  const client = useQueryClient();
  const key = getGetWeekendPlanQueryKey(weekend);
  const query = useGetWeekendPlan(weekend);
  const plan = query.data;
  const mutateOptions = (success: string) => ({
    onError: () => {
      toast.error("Could not update your plan");
      void client.invalidateQueries({ queryKey: key });
    },
    onSuccess: () => toast.success(success),
    onSettled: () => void client.invalidateQueries({ queryKey: key }),
  });
  const addMutation = useAddWeekendPlanEntry({
    mutation: mutateOptions("Added to your weekend"),
  });
  const removeMutation = useRemoveWeekendPlanEntry({
    mutation: mutateOptions("Removed from your weekend"),
  });
  const updateMutation = useUpdateWeekendPlanEntry({
    mutation: mutateOptions("Note saved"),
  });
  const add = (event: EventSummary) => {
    const previous = client.getQueryData<WeekendPlan>(key);
    client.setQueryData<WeekendPlan>(key, {
      weekend,
      entries: [
        ...(previous?.entries ?? []),
        { eventId: event.id, event, note: "" },
      ],
    });
    addMutation.mutate({ weekend, data: { eventId: event.id, note: "" } });
  };
  const remove = (eventId: string) => {
    const previous = client.getQueryData<WeekendPlan>(key);
    if (previous)
      client.setQueryData<WeekendPlan>(key, {
        ...previous,
        entries: previous.entries.filter((entry) => entry.eventId !== eventId),
      });
    removeMutation.mutate({ weekend, eventId });
  };
  const updateNote = (eventId: string, note: string) =>
    updateMutation.mutate({ weekend, eventId, data: { note } });
  return {
    weekend,
    plan,
    isLoading: query.isLoading,
    error: query.error,
    isPending:
      addMutation.isPending ||
      removeMutation.isPending ||
      updateMutation.isPending,
    contains: (id: string) =>
      plan?.entries.some((e) => e.eventId === id) ?? false,
    add,
    remove,
    updateNote,
    refetch: query.refetch,
  };
}
