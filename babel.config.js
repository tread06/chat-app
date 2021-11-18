module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    //presets: ['babel-preset-expo', 'module:react-native-dotenv'],
    //presets: ['babel-preset-expo', 'module:metro-react-native-babel-preset'],
    //presets: ['module:metro-react-native-babel-preset'],
    // plugins: [
    //   [
    //     'module:react-native-dotenv',
    //     {
    //       moduleName: '@env',
    //       path: '.env',
    //       blacklist: null,
    //       whitelist: null,
    //       safe: false,
    //       allowUndefined: true,
    //     },
    //   ],
    // ],
    plugins: [
      "module:react-native-dotenv",
    ]
  };
};
