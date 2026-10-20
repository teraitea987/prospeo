import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";

export default tseslint.config(
  { ignores: [".next/**", ".next-local-e2e/**", "playwright-report/**", "test-results/**", "next-env.d.ts", "src/generated/**"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx,mjs}"],
    languageOptions: { globals: { process: "readonly", console: "readonly" } },
  },
  { files: ["src/**/*.{ts,tsx}"], ...reactHooks.configs.flat.recommended },
);
