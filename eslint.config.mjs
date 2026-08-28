import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import prettierRecommended from "eslint-plugin-prettier/recommended";

const eslintConfig = [
  ...nextCoreWebVitals,
  prettierRecommended,
  {
    rules: {
      "prettier/prettier": "warn",
    },
  },
  {
    ignores: [".next/**", "node_modules/**"],
  },
];

export default eslintConfig;
