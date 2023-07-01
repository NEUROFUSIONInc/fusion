module.exports = {
  extends: [
    "universe/native",
    "universe/shared/typescript-analysis",
    "plugin:@tanstack/eslint-plugin-query/recommended",
    "prettier",
  ],
  plugins: ["@typescript-eslint", "unused-imports", "@tanstack/query"],
  ignorePatterns: ["ios", "android"],
  overrides: [
    {
      files: ["*.ts", "*.tsx", "*.d.ts", "*.js", "*.jsx", "!*.stories.tsx"],
      parserOptions: {
        project: "./tsconfig.json",
      },
      rules: {
        "prettier/prettier": "off",
        "unused-imports/no-unused-imports": "error",
        "@tanstack/query/exhaustive-deps": "error",
        "@tanstack/query/prefer-query-object-syntax": "error",
        "import/order": [
          1,
          {
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
      },
    },
  ],
};
