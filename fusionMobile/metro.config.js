// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

module.exports = (async () => {
  const {
    resolver: { sourceExts, assetExts },
  } = await getDefaultConfig(__dirname);

  return {
    resolver: {
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
      sourceExts,
      assetExts: [...assetExts, "db"],
    },
    watchFolders: [path.resolve(__dirname, "../")],
    transformer: {
      assetPlugins: ["expo-asset/tools/hashAssetFiles"],
    },
    maxWorkers: 2,
    web: {
      // disable webpack for rn-web
      webpack: false,
    },
  };
})();
