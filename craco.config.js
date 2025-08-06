require('dotenv').config();

const webpack = require('webpack');

const port = process.env.PORT || 3000;

// Immediately print the URL to the console when this config file is loaded
console.log(`Attempting to start development server on port ${port}`);
console.log(`URL: http://localhost:${port}`);
console.log('----------------------------------------------------');

module.exports = {
  // Add this devServer block
  devServer: {
    port: port,
  },
  webpack: {
    configure: (webpackConfig, { env, paths }) => {
      // Add fallbacks for node core modules
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        "stream": require.resolve("stream-browserify"),
        "assert": require.resolve("assert/"),
        "util": require.resolve("util/"),
        "crypto": require.resolve("crypto-browserify"),
        "http": require.resolve("stream-http"),
        "https": require.resolve("https-browserify"),
        "os": require.resolve("os-browserify/browser"),
        "buffer": require.resolve("buffer"),
      };

      // Add the necessary plugins
      webpackConfig.plugins = [
        ...webpackConfig.plugins,
        new webpack.ProvidePlugin({
          process: "process/browser",
          Buffer: ["buffer", "Buffer"],
        }),
      ];

      return webpackConfig;
    },
  },
};