import "@testing-library/jest-dom/vitest";
import { afterAll, afterEach, beforeAll } from "vitest";
import { cleanup } from "@testing-library/react";
import { server } from "@/mocks/server";
import { mockStore } from "@/mocks/store";

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => {
  cleanup();
  server.resetHandlers();
  mockStore.reset();
  localStorage.clear();
});
afterAll(() => server.close());
