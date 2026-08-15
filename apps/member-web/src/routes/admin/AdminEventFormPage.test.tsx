import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { renderApp } from "@/test/render";

async function completeRequiredFields(
  user: ReturnType<typeof userEvent.setup>,
  name: string,
) {
  await screen.findByRole("option", { name: "Paul Kelly" });
  await user.type(screen.getByLabelText("Event name"), name);
  await user.selectOptions(
    screen.getByLabelText("Artist"),
    "11111111-1111-4111-8111-111111111111",
  );
  await user.selectOptions(
    screen.getByLabelText("Venue"),
    "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  );
  await user.type(screen.getByLabelText("Starts at"), "2026-09-18T20:00");
  await user.type(screen.getByLabelText("Doors at"), "2026-09-18T19:00");
  await user.type(
    screen.getByLabelText("Description"),
    "A complete fictional demonstration event description for testing.",
  );
}
describe("admin event form", () => {
  it("shows accessible frontend validation", async () => {
    localStorage.setItem("sgp-mock-role", "admin");
    const user = userEvent.setup();
    renderApp("/admin/events/new");
    await screen.findByRole("heading", { name: "Create event" });
    await user.click(screen.getByRole("button", { name: "Create event" }));
    expect(
      await screen.findByText("Use at least 3 characters"),
    ).toBeInTheDocument();
    expect(screen.getByText("Choose an artist")).toBeInTheDocument();
  });
  it("creates an event successfully", async () => {
    localStorage.setItem("sgp-mock-role", "admin");
    const user = userEvent.setup();
    renderApp("/admin/events/new");
    await completeRequiredFields(user, "Laneway Echoes");
    await user.click(screen.getByRole("button", { name: "Create event" }));
    expect(
      await screen.findByRole("heading", { name: "Manage events" }),
    ).toBeInTheDocument();
    expect(await screen.findByText("Laneway Echoes")).toBeInTheDocument();
  });
  it("displays API validation errors", async () => {
    localStorage.setItem("sgp-mock-role", "admin");
    const user = userEvent.setup();
    renderApp("/admin/events/new");
    await completeRequiredFields(user, "Reject this show");
    await user.click(screen.getByRole("button", { name: "Create event" }));
    expect(
      await screen.findByText("The mock API rejected this event name."),
    ).toBeInTheDocument();
  });
});
