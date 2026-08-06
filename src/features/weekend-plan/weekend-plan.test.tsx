import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it } from "vitest";
import { renderApp } from "@/test/render";

it("adds an event to the weekend plan", async () => {
  const user = userEvent.setup();
  renderApp("/events/10000000-0000-4000-8000-000000000003");
  await screen.findByRole("heading", {
    name: "Darren Hanlon: Small Town Stories",
  });
  await user.click(screen.getByRole("button", { name: "Add to weekend" }));
  await user.click(screen.getByRole("link", { name: "Weekend plan" }));
  await screen.findByRole("heading", { name: "Your weekend plan" });
  expect(
    await screen.findByRole("heading", {
      name: "Darren Hanlon: Small Town Stories",
    }),
  ).toBeInTheDocument();
  expect(screen.getByLabelText("Your note")).toBeInTheDocument();
});
