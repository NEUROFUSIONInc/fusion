// @ts-check
const { defineConfig } = require("eslint-define-config");

module.exports = defineConfig({
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "unused-imports", "import"],
  extends: [
    "next/core-web-vitals",
    "plugin:@shopify/typescript",
    "plugin:@shopify/react",
    "plugin:@shopify/prettier",
    "plugin:storybook/recommended",
  ],
  overrides: [
    {
      // this file is auto generated, so we want to disable any offending rules
      files: ["next-env.d.ts"],
      rules: {
        "@typescript-eslint/triple-slash-reference": "off",
        "spaced-comment": "off",
      },
    },
    {
      files: ["*.config.js"],
      extends: ["plugin:@shopify/node"],
    },
    {
      files: ["*.ts", "*.tsx", "*.js", "*.jsx", "!*.stories.tsx"],
      rules: {
        "react/react-in-jsx-scope": "off",
        "unused-imports/no-unused-imports": "error",
        "import/order": [
          1,
          {
            // groups: ["external", "builtin", "internal", "sibling", "parent", "index"],
            "newlines-between": "always",
            pathGroups: [
              {
                pattern: "components",
                group: "internal",
              },
              {
                pattern: "common",
                group: "internal",
              },
              {
                pattern: "routes/ **",
                group: "internal",
              },
              {
                pattern: "assets/**",
                group: "internal",
                position: "after",
              },
            ],
            pathGroupsExcludedImportTypes: ["internal"],
            alphabetize: {
              order: "asc",
              caseInsensitive: true,
            },
          },
        ],
        "unused-imports/no-unused-vars": [
          "warn",
          {
            vars: "all",
            varsIgnorePattern: "^_",
            args: "after-used",
            argsIgnorePattern: "^_",
          },
        ],
        "prettier/prettier": "off",
        "no-console": "off",
        "no-nested-ternary": "off",
        "react/no-children-prop": "off",
        "line-comment-position": "off",
        "@shopify/strict-component-boundaries": "off",
        "@typescript-eslint/naming-convention": [
          "error",
          {
            selector: "variable",
            format: ["UPPER_CASE", "camelCase", "PascalCase"],
          },
        ],
        // THis is intended for internationalisation - when we are ready to add this we should enable this rule
        "@shopify/jsx-no-hardcoded-content": "off",
        "@shopify/jsx-prefer-fragment-wrappers": "off",
        "@shopify/jsx-no-complex-expressions": "off",
        "@shopify/images-no-direct-imports": "off",
        "@typescript-eslint/consistent-indexed-object-style": ["error", "record"],
        "no-process-env": "off",
        "no-warning-comments": "off",
      },
    },
  ],
});
