import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";

export default tseslint.config(
  {
    ignores: [
      "dist",
      "coverage",
      "playwright-report",
      "apps/member-web/dist",
      "apps/member-web/coverage",
      "apps/member-web/playwright-report",
      "packages/api-client/src/generated",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2023,
      globals: {
        window: "readonly",
        document: "readonly",
        localStorage: "readonly",
        fetch: "readonly",
        Headers: "readonly",
        RequestInit: "readonly",
        crypto: "readonly",
        structuredClone: "readonly",
      },
    },
    plugins: { "react-hooks": reactHooks, "react-refresh": reactRefresh },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": "off",
      "@typescript-eslint/no-explicit-any": "error",
    },
  },
  {
    files: [
      "scripts/**/*.mjs",
      "packages/api-client/**/*.mjs",
      "eslint.config.js",
    ],
    languageOptions: { globals: { process: "readonly", console: "readonly" } },
  },
);
