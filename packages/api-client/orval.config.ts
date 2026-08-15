import { defineConfig } from "orval";

const input = process.env.OPENAPI_INPUT ?? "./openapi/gig-planner-v1.json";

export default defineConfig({
  sydneyGigPlanner: {
    input,
    output: {
      mode: "tags-split",
      target: "./src/generated/client.ts",
      schemas: "./src/generated/models",
      client: "react-query",
      httpClient: "fetch",
      mock: false,
      clean: true,
      prettier: true,
      override: {
        fetch: { includeHttpResponseReturnType: false },
        mutator: {
          path: "./src/fetcher.ts",
          name: "apiFetch",
        },
        query: {
          signal: true,
        },
      },
    },
  },
});
