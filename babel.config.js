module.exports = function (api) {
  api.cache(true);
  return {
    // SDK 54 preset (not 57) — Expo Go Hermes needs private-field transforms.
    // Reanimated / worklets plugins are wired by babel-preset-expo automatically.
    presets: ["babel-preset-expo"],
  };
};
