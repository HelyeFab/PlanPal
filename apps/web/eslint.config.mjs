import next from "eslint-config-next";

/**
 * ESLint flat config. Next.js 16 ships native flat configs from
 * `eslint-config-next` (no FlatCompat bridge needed). The default export bundles
 * core-web-vitals + the TypeScript rules.
 */
const eslintConfig = [
  ...next,
  {
    ignores: [".next/**", "node_modules/**"],
  },
];

export default eslintConfig;
