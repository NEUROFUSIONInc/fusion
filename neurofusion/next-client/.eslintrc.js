/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  extends: [
    "next/core-web-vitals",
    "plugin:@shopify/typescript",
    "plugin:@shopify/react",
    "plugin:@shopify/prettier",
    // "eslint-config-prettier",
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
        "prettier/prettier": "off",
        "no-console": "error",
        "no-nested-ternary": "off",
        "react/no-children-prop": "off",
        "line-comment-position": "off",
        "@shopify/strict-component-boundaries": "off",
        // THis is intended for internationalisation - when we are ready to add this we should enable this rule
        "@shopify/jsx-no-hardcoded-content": "off",
        "@shopify/jsx-prefer-fragment-wrappers": "off",
        "@shopify/jsx-no-complex-expressions": "off",
        "@shopify/images-no-direct-imports": "off",
        "@typescript-eslint/consistent-indexed-object-style": ["error", "record"],
        "no-process-env": "off",
      },
    },
  ],
};
