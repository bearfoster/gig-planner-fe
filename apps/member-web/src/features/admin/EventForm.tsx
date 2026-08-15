import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import type {
  CreateEventRequest,
  Event,
} from "@gig-planner/api-client/generated/models";
import { useListArtists } from "@gig-planner/api-client/generated/artists/artists";
import { useListVenues } from "@gig-planner/api-client/generated/venues/venues";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";

const schema = z.object({
  name: z.string().min(3, "Use at least 3 characters").max(120),
  artistId: z.string().uuid("Choose an artist"),
  venueId: z.string().uuid("Choose a venue"),
  startsAt: z.string().min(1, "Choose a start time"),
  doorsAt: z.string().min(1, "Choose a doors time"),
  genre: z.enum([
    "rock",
    "indie",
    "folk",
    "electronic",
    "jazz",
    "punk",
    "pop",
    "country",
  ]),
  status: z.enum(["available", "limited", "sold-out", "cancelled"]),
  price: z.number().min(0, "Price cannot be negative").nullable(),
  imageUrl: z.string().url("Enter a valid image URL"),
  description: z.string().min(20, "Use at least 20 characters"),
  ticketUrl: z.string().url("Enter a valid URL").nullable(),
  ageRestriction: z.string().min(1, "Required"),
  featured: z.boolean(),
});
type FormValues = z.infer<typeof schema>;
const toLocal = (value: string) => (value ? value.slice(0, 16) : "");
const defaults = (event?: Event): FormValues => ({
  name: event?.name ?? "",
  artistId: event?.artist.id ?? "",
  venueId: event?.venue.id ?? "",
  startsAt: toLocal(event?.startsAt ?? ""),
  doorsAt: toLocal(event?.doorsAt ?? ""),
  genre: event?.genre ?? "indie",
  status: event?.status ?? "available",
  price: event?.price ?? 35,
  imageUrl:
    event?.imageUrl ??
    "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=80",
  description: event?.description ?? "",
  ticketUrl: event?.ticketUrl ?? "https://example.com/tickets",
  ageRestriction: event?.ageRestriction ?? "18+",
  featured: event?.featured ?? false,
});
export function EventForm({
  event,
  onSubmit,
  pending,
  apiErrors = {},
}: {
  event?: Event;
  onSubmit: (data: CreateEventRequest) => void;
  pending: boolean;
  apiErrors?: Record<string, string[]>;
}) {
  const artists = useListArtists();
  const venues = useListVenues();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaults(event),
  });
  const fieldError = (name: keyof FormValues) =>
    errors[name]?.message || apiErrors[name]?.[0];
  const submit = (values: FormValues) =>
    onSubmit({
      ...values,
      startsAt: new Date(values.startsAt).toISOString(),
      doorsAt: new Date(values.doorsAt).toISOString(),
    });
  return (
    <form noValidate onSubmit={handleSubmit(submit)} className="space-y-7">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Event name" error={fieldError("name")} wide>
          <Input
            {...register("name")}
            aria-invalid={Boolean(fieldError("name"))}
          />
        </Field>
        <Field label="Artist" error={fieldError("artistId")}>
          <Select {...register("artistId")}>
            <option value="">Choose artist</option>
            {artists.data?.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Venue" error={fieldError("venueId")}>
          <Select {...register("venueId")}>
            <option value="">Choose venue</option>
            {venues.data?.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Starts at" error={fieldError("startsAt")}>
          <Input type="datetime-local" {...register("startsAt")} />
        </Field>
        <Field label="Doors at" error={fieldError("doorsAt")}>
          <Input type="datetime-local" {...register("doorsAt")} />
        </Field>
        <Field label="Genre" error={fieldError("genre")}>
          <Select {...register("genre")}>
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
                {x}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Availability" error={fieldError("status")}>
          <Select {...register("status")}>
            <option value="available">Available</option>
            <option value="limited">Limited</option>
            <option value="sold-out">Sold out</option>
            <option value="cancelled">Cancelled</option>
          </Select>
        </Field>
        <Field label="Price (AUD)" error={fieldError("price")}>
          <Controller
            control={control}
            name="price"
            render={({ field }) => (
              <Input
                type="number"
                min="0"
                step="1"
                value={field.value ?? ""}
                onChange={(e) =>
                  field.onChange(
                    e.target.value === "" ? null : Number(e.target.value),
                  )
                }
              />
            )}
          />
        </Field>
        <Field label="Age restriction" error={fieldError("ageRestriction")}>
          <Input {...register("ageRestriction")} />
        </Field>
        <Field label="Image URL" error={fieldError("imageUrl")} wide>
          <Input type="url" {...register("imageUrl")} />
        </Field>
        <Field label="Ticket URL" error={fieldError("ticketUrl")} wide>
          <Controller
            control={control}
            name="ticketUrl"
            render={({ field }) => (
              <Input
                type="url"
                value={field.value ?? ""}
                onChange={(e) => field.onChange(e.target.value || null)}
              />
            )}
          />
        </Field>
        <Field label="Description" error={fieldError("description")} wide>
          <Textarea {...register("description")} />
        </Field>
      </div>
      <label className="flex items-center gap-3 font-semibold">
        <input
          type="checkbox"
          className="size-5 accent-violet"
          {...register("featured")}
        />
        Feature on discovery page
      </label>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : event ? "Save changes" : "Create event"}
      </Button>
    </form>
  );
}
function Field({
  label,
  error,
  wide,
  children,
}: {
  label: string;
  error?: string;
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className={wide ? "sm:col-span-2" : ""}>
      <span className="mb-1.5 block text-sm font-bold">{label}</span>
      {children}
      {error && (
        <span
          role="alert"
          className="mt-1.5 block text-sm font-semibold text-red-700"
        >
          {error}
        </span>
      )}
    </label>
  );
}
