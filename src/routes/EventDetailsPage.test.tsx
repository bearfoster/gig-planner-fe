import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderApp } from "@/test/render";

describe("event details", () => {
  it("shows complete event details", async () => {
    renderApp("/events/10000000-0000-4000-8000-000000000001");
    expect(
      await screen.findByRole("heading", {
        name: "Paul Kelly: From St Kilda to Sydney",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("About this gig")).toBeInTheDocument();
    expect(screen.getAllByText("Enmore Theatre").length).toBeGreaterThan(0);
  });
  it("shows a useful 404 state", async () => {
    renderApp("/events/00000000-0000-4000-8000-000000000000");
    expect(
      await screen.findByText(
        "That gig could not be found. It may have left the lineup.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Back to gigs" }),
    ).toBeInTheDocument();
  });
});
