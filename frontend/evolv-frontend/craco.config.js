// At your project root, next to package.json
module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Prevent source-map-loader from trying to load TS source maps
      webpackConfig.module.rules.push({
        test: /\.js$/,
        enforce: 'pre',
        use: ['source-map-loader'],
        exclude: [
          /node_modules\/@microsoft\/fetch-event-source/
        ]
      });
      return webpackConfig;
    }
  }
};
