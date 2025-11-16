// eslint.config.js
import antfu from "@antfu/eslint-config";

export default antfu({
  // `.eslintignore` is no longer supported in Flat config, use `ignores` instead
  // The `ignores` option in the option (first argument) is specifically treated to always be global ignores
  // And will **extend** the config's default ignores, not override them
  // You can also pass a function to modify the default ignores
  ignores: [
    "**/fixtures",
    // ...globs
  ],

  // Parse the `.gitignore` file to get the ignores, on by default
  gitignore: true,

  stylistic: {
    indent: 2, // 4, or 'tab'
    quotes: "double",
  },
  rules: {
    "style/semi": ["error", "always"],
    "node/prefer-global/process": ["off", "never"],
    "no-undef": ["off", "never"],
  },
  // TypeScript and Vue are autodetected, you can also explicitly enable them:
  typescript: true,
  vue: true,
});
