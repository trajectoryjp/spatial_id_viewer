const path = require('path');

const webpack = require('webpack');
const BundleDeclarationsPlugin = require('bundle-declarations-webpack-plugin').default;

/** @type {import('webpack').Configuration} */
const config = {
  mode: 'production',
  devtool: 'source-map',
  entry: './src/index.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: './index.js',
    library: {
      type: 'module',
    },
  },
  experiments: {
    outputModule: true,
  },
  plugins: [
    new webpack.optimize.LimitChunkCountPlugin({
      maxChunks: 1,
    }),
    new BundleDeclarationsPlugin({
      compilationOptions: {
        followSymlinks: false,
      },
    }),
  ],
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.([cm]?ts|tsx)$/,
        use: 'ts-loader',
      },
    ],
  },
};

module.exports = config;
