/* eslint-disable no-undef */
// Learn more https://docs.expo.io/guides/customizing-metro
const path = require("path");

const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

const { resolver, transformer } = config;

config.resolver = {
  ...resolver,
  extraNodeModules: new Proxy(
    {},
    {
      get: (target, name) => {
        return path.join(__dirname, `node_modules/${name}`);
      },
    }
  ),
  alias: {
    "~": path.resolve(__dirname, "src"),
  },
  assetExts: resolver.assetExts.filter((ext) => ext !== "svg"),
  sourceExts: [...resolver.sourceExts, "svg"],
  resolverMainFields: ["sbmodern", "react-native", "browser", "main"],
};

config.transformer = {
  ...transformer,
  assetPlugins: ["expo-asset/tools/hashAssetFiles"],
  babelTransformerPath: require.resolve("react-native-svg-transformer"),
};

config.maxWorkers = 2;

config.web = {
  // disable webpack for rn-web
  webpack: false,
};

module.exports = config;
