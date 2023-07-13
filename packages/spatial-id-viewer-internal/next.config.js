const path = require('path');

const CopyWebpackPlugin = require('copy-webpack-plugin');
const FileAliasPlugin = require('@heniker/file-alias-webpack-plugin').FileAliasPlugin;
const webpack = require('webpack');

const cesiumSourceDir = '../../node_modules/cesium/Source';
const cesiumWorkersDir = '../Build/Cesium/Workers';
const staticDir = '../public/static';

/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: false,
  swcMinify: true,
  poweredByHeader: false,
  webpack(config, options) {
    return Object.assign(config, {
      plugins: [
        ...config.plugins,
        new CopyWebpackPlugin({
          patterns: [
            {
              from: path.join(cesiumSourceDir, cesiumWorkersDir),
              to: path.join(staticDir, 'cesium/Workers'),
            },
            {
              from: path.join(cesiumSourceDir, 'Assets'),
              to: path.join(staticDir, 'cesium/Assets'),
            },
            {
              from: path.join(cesiumSourceDir, 'Widgets'),
              to: path.join(staticDir, 'cesium/Widgets'),
            },
          ],
        }),
        new webpack.DefinePlugin({
          CESIUM_BASE_URL: JSON.stringify('/static/cesium'),
        }),
      ],
      resolve: {
        ...config.resolve,
        plugins: [...config.resolve.plugins, new FileAliasPlugin()],
      },
      module: {
        ...config.module,
        rules: [
          ...config.module.rules,
          {
            test: /\.(?:glb|tif)$/,
            use: 'arraybuffer-loader',
          },
        ],
      },
    });
  },
  experimental: {
    externalDir: true,
  },
};
