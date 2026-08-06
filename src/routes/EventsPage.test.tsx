import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { renderApp, renderBrowserApp } from "@/test/render";

describe("event catalogue", () => {
  it("loads and renders events from the API", async () => {
    renderApp("/events");
    expect(screen.getByLabelText("Loading page")).toBeInTheDocument();
    expect(
      await screen.findByRole("heading", {
        name: "Paul Kelly: From St Kilda to Sydney",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("Showing 9 of 12 gigs")).toBeInTheDocument();
  });
  it("searches, filters, and reflects state in the URL", async () => {
    const user = userEvent.setup();
    renderBrowserApp("/events");
    await screen.findByRole("heading", { name: "Gigs around Sydney" });
    await user.type(
      screen.getByPlaceholderText("Search artist or event…"),
      "Darren Hanlon",
    );
    await user.click(screen.getByRole("button", { name: "Search" }));
    expect(
      await screen.findByRole("heading", {
        name: "Darren Hanlon: Small Town Stories",
      }),
    ).toBeInTheDocument();
    expect(window.location.search).toContain("search=Darren+Hanlon");
    await user.selectOptions(screen.getByLabelText("Suburb"), "Marrickville");
    expect(window.location.search).toContain("suburb=Marrickville");
  });
});
