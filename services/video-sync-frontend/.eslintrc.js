// .eslintrc.js
module.exports = {
  env: {
    browser: true,
    es2021: true,
    worker: true,
    jest: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:@typescript-eslint/recommended",
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: "module",
  },
  plugins: ["react", "@typescript-eslint"],
  rules: {
    quotes: ["error", "single"],
    "no-else-return": "error",
    "react/jsx-filename-extension": ["error", { extensions: [".js", ".jsx"] }],
    "react/button-has-type": "error",
    "comma-dangle": ["error", "always-multiline"],
    "react/no-deprecated": "off", // Disable deprecated warnings
    "react/prop-types": "off", // Disable prop-types validation
  },
  settings: {
    react: {
      version: "detect",
    },
  },
};
