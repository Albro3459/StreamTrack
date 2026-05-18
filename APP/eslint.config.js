/*
 * Dev Dependencies (using 'npm i -D package_name')
 * "@eslint/js": "^9.39.4",
 * "eslint": "^9.0.0",
 * "eslint-config-expo": "~55.0.1",
 * "eslint-plugin-import": "^2.32.0",
 * "typescript-eslint": "^8.59.4"
*/
// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const js = require("@eslint/js");
const tseslint = require("typescript-eslint");
const importPlugin = require("eslint-plugin-import");
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  {
    ignores: ["**/*eslint*", "dist/*"],
  },
  {
    files: ["**/*.{ts,tsx,js,jsx,cjs,mjs}"],
    ...js.configs.recommended,
  },
  ...expoConfig,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: ["./tsconfig.json"],
        tsconfigRootDir: __dirname,
      },
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
      importPlugin,
    },
    rules: {
      "no-duplicate-imports": "off",
      "importPlugin/no-duplicates": "error",

      "no-cond-assign": "error",
      "no-unreachable": "error",
      "consistent-return": "warn",
      "no-unsafe-finally": "error",
      "no-debugger": "warn",
      "no-useless-escape": "warn",

      "no-unused-expressions": "off",
      "@typescript-eslint/no-unused-expressions": [
        "warn",
        {
          allowShortCircuit: true,
          allowTernary: true,
          allowTaggedTemplates: false,
        },
      ],

      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          args: "after-used",
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],

      "@typescript-eslint/consistent-type-assertions": [
        "warn",
        {
          assertionStyle: "as",
          objectLiteralTypeAssertions: "never",
        },
      ],
      "@typescript-eslint/no-unnecessary-type-assertion": "warn",

      "@typescript-eslint/no-explicit-any": "off",
    },
  },
]);
