import { expect, test } from "@playwright/test";

const eventPath = "/events/10000000-0000-4000-8000-000000000001";
test.beforeEach(async ({ page }) => {
  await page.goto("/profile");
  const reset = page.getByRole("button", { name: "Reset mock data" });
  if (await reset.isVisible()) await reset.click();
});
test("browse events, apply a filter, and open an event", async ({ page }) => {
  await page.goto("/events");
  await page.getByLabel("Genre").selectOption("folk");
  await expect(page).toHaveURL(/genre=folk/);
  await page
    .getByRole("heading", { name: "Paul Kelly: From St Kilda to Sydney" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Paul Kelly: From St Kilda to Sydney" }),
  ).toBeVisible();
  await expect(page.getByText("About this gig")).toBeVisible();
});
test("favourite an event and find it in favourites", async ({ page }) => {
  await page.goto(eventPath);
  await page
    .getByRole("button", { name: /Add Paul Kelly.*to favourites/ })
    .click();
  await page.getByRole("link", { name: "Favourites" }).click();
  await expect(
    page.getByRole("heading", { name: "Paul Kelly: From St Kilda to Sydney" }),
  ).toBeVisible();
});
test("add an event to the weekend and edit its note", async ({ page }) => {
  await page.goto(eventPath);
  await page.getByRole("button", { name: "Add to weekend" }).click();
  await page.getByRole("link", { name: "Weekend plan" }).click();
  await page.getByLabel("Your note").fill("Meet by the merch desk at 7:30");
  await page.getByRole("button", { name: "Save note" }).click();
  await expect(page.getByText("Note saved")).toBeVisible();
});
test("switch to admin, create an event, and find it in the catalogue", async ({
  page,
}) => {
  await page.goto("/profile");
  await page.getByRole("button", { name: "Admin" }).click();
  await page.goto("/admin/events/new");
  await page.getByLabel("Event name").fill("Parramatta Night Signals");
  await page.getByLabel("Artist").selectOption({ label: "Paul Kelly" });
  await page.getByLabel("Venue").selectOption({ label: "Enmore Theatre" });
  await page.getByLabel("Starts at").fill("2026-09-18T20:00");
  await page.getByLabel("Doors at").fill("2026-09-18T19:00");
  await page
    .getByLabel("Description")
    .fill("A fictional cross-city live music night created by the smoke test.");
  await page.getByRole("button", { name: "Create event" }).click();
  await expect(page.getByText("Parramatta Night Signals")).toBeVisible();
  await page.getByRole("link", { name: "Gigs" }).click();
  await page.getByPlaceholder("Search artist or event…").fill("Parramatta Night Signals");
  await expect(
    page.getByRole("heading", { name: "Parramatta Night Signals" }),
  ).toBeVisible();
});
