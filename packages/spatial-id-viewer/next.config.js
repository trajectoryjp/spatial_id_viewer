const path = require('path');

const CopyWebpackPlugin = require('copy-webpack-plugin');
const FileAliasPlugin = require('@heniker/file-alias-webpack-plugin').FileAliasPlugin;
const LicensePlugin = require('webpack-license-plugin');
const webpack = require('webpack');

const nodeModulesDir = path.resolve('..', '..', 'node_modules');
const cesiumSourceDir = path.join(nodeModulesDir, 'cesium/Source');
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
        new LicensePlugin({
          additionalFiles: {
            // 必要な項目だけに絞る
            'oss-licenses.json': (packages) =>
              JSON.stringify(
                packages.map(({ name, licenseText }) => {
                  return {
                    name,
                    licenseText,
                  };
                }),
                null,
                '  '
              ),
          },
          outputFilename: 'oss-licenses-full.json',
          replenishDefaultLicenseTexts: true,
          licenseOverrides: {
            'fast-shallow-equal@1.0.0': 'Unlicense',
            'react-universal-interface@0.6.2': 'Unlicense',
          },
          excludedPackageTest: (name) => name.startsWith('spatial-id-'),
          includePackages: () => [
            path.join(nodeModulesDir, 'tailwindcss'),
            path.join(nodeModulesDir, 'webpack'),
            // nextjs にバンドルされている
            // このアプリ側では使っていないが、ライセンス表記のためインストールしている
            path.join(nodeModulesDir, 'core-js'),
            path.join(nodeModulesDir, 'whatwg-fetch'),
            path.join(nodeModulesDir, 'object-assign'),
          ],
        }),
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
