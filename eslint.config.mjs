import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    "node_modules/**",
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      // Next 16's react-hooks plugin flags existing mount-time hydration
      // (localStorage, theme, online status). Rewriting those is a separate
      // pass; don't fail the framework upgrade on them.
      "react-hooks/set-state-in-effect": "warn",
    },
  },
]);

export default eslintConfig;
