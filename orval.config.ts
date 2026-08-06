import { defineConfig } from "orval";

const input = process.env.OPENAPI_INPUT ?? "./openapi/sydney-gig-planner.yaml";

export default defineConfig({
  sydneyGigPlanner: {
    input,
    output: {
      mode: "tags-split",
      target: "./src/api/generated/client.ts",
      schemas: "./src/api/generated/models",
      client: "react-query",
      httpClient: "fetch",
      mock: false,
      clean: true,
      prettier: true,
      override: {
        fetch: { includeHttpResponseReturnType: false },
        mutator: {
          path: "./src/api/fetcher.ts",
          name: "apiFetch",
        },
        query: {
          signal: true,
        },
      },
    },
  },
});
