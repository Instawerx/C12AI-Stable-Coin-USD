
module.exports = [
  {
    files: ["**/*.js", "**/*.ts"],
    ignores: [
      "typechain-types/**",
      "node_modules/**",
      "artifacts/**",
      "cache/**",
      "coverage/**",
      "frontend/.next/**",
      "frontend/out/**",
      "generated/**",
      "**/node_modules/**",
      "**/*.d.ts",
      "**/build/**",
      "**/dist/**"
    ],
    languageOptions: {
      parser: require("@typescript-eslint/parser"),
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module"
      }
    },
    plugins: {
      "@typescript-eslint": require("@typescript-eslint/eslint-plugin")
    },
    rules: {
      "no-console": "warn",
      "no-unused-vars": "error",
      "@typescript-eslint/no-unused-vars": "error",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/no-explicit-any": "warn"
    }
  }
];