const path = require('path');

const webpack = require('webpack');

/** @type {import('webpack').Configuration} */
const config = {
  mode: 'production',
  devtool: 'source-map',
  entry: './src/index.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: './index.bundle.js',
  },
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
