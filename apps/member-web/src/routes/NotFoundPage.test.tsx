import { screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { renderApp } from "@/test/render";
it("renders the route-level not-found page", async () => {
  renderApp("/definitely-not-a-route");
  expect(
    await screen.findByRole("heading", {
      name: "This page isn’t on the bill.",
    }),
  ).toBeInTheDocument();
  expect(screen.getByText("404 · Wrong venue")).toBeInTheDocument();
});
