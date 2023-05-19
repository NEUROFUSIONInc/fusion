module.exports = {
  extends: [
    "universe/native",
    "universe/shared/typescript-analysis",
    "prettier",
  ],
  plugins: ["@typescript-eslint", "unused-imports"],
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
