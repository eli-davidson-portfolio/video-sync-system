// config-overrides.js
const { override, addWebpackModuleRule } = require("customize-cra");
const path = require("path");

module.exports = override(
  addWebpackModuleRule({
    test: /\.worker\.js$/,
    use: { loader: "worker-loader" },
  })
);
