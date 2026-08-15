import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it } from "vitest";
import { renderApp } from "@/test/render";

it("adds and removes a favourite optimistically", async () => {
  const user = userEvent.setup();
  renderApp("/events/10000000-0000-4000-8000-000000000002");
  await screen.findByRole("heading", { name: "Ash Naylor — Late Solo Set" });
  await user.click(
    screen.getByRole("button", {
      name: "Add Ash Naylor — Late Solo Set to favourites",
    }),
  );
  await user.click(screen.getByRole("link", { name: "Favourites" }));
  await screen.findByRole("heading", { name: "Your favourites" });
  expect(
    await screen.findByRole("heading", { name: "Ash Naylor — Late Solo Set" }),
  ).toBeInTheDocument();
  await user.click(
    screen.getByRole("button", {
      name: "Remove Ash Naylor — Late Solo Set from favourites",
    }),
  );
  expect(
    await screen.findByRole(
      "heading",
      { name: "Nothing saved yet" },
      { timeout: 3000 },
    ),
  ).toBeInTheDocument();
});
