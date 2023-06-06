const path = require('path')
const ESLintWebpackPlugin = require('eslint-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CssMinimizerWebpackPlugin = require('css-minimizer-webpack-plugin')
const TerserWebpackPlugin = require('terser-webpack-plugin')
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin')

const isProduction = process.env.NODE_ENV === 'production'

const getStyleLoader = (pre) => {
  return [
    isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
    'css-loader',
    {
      // 处理css兼容性
      // 配合package.json中的browserslist来指定兼容性
      loader: 'postcss-loader',
      options: {
        postcssOptions: {
          plugins: ['postcss-preset-env'],
        },
      },
    },
    pre,
  ].filter(Boolean) // 过滤掉undefiend的值
}

module.exports = {
  entry: './src/main.js',
  output: {
    path: isProduction ? path.resolve(__dirname, '../dist') : undefined,
    filename: isProduction
      ? 'static/js/[name].[contenthash:10].js'
      : 'static/js/[name].js',
    chunkFilename: isProduction
      ? 'static/js/[name].[contenthash:10].chunk.js'
      : 'static/js/[name].chunk.js',
    assetModuleFilename: 'static/media/[hash:10][ext][query]',
    clean: true,
  },
  module: {
    rules: [
      // 处理css
      {
        test: /\.css$/,
        use: getStyleLoader(),
      },
      {
        test: /\.less$/,
        use: getStyleLoader('less-loader'),
      },
      // 图片
      {
        test: /\.(jpe?g|png|gif|webp|svg)/,
        type: 'asset', // 可以转base64
        parser: {
          dataUrlCondition: {
            maxsize: 10 * 1024, // 小于10kb转成base64的形式
          },
        },
      },
      // 处理其他资源(字体图标)
      {
        test: /\.(woff2?|ttf)/,
        type: 'asset/resource', // 不做任何处理
      },
      // js
      {
        test: /\.jsx?$/,
        include: path.resolve(__dirname, '../src'),
        loader: 'babel-loader',
        options: {
          cacheDirectory: true,
          cacheCompression: false,
          plugins: [!isProduction && 'react-refresh/babel'].filter(Boolean), // 激活js的HMR功能
        },
      },
    ],
  },
  // html
  plugins: [
    new ESLintWebpackPlugin({
      context: path.resolve(__dirname, '../src'),
      exclude: 'node_modules',
      cache: true,
      cacheLocation: path.resolve(
        __dirname,
        '../node_modules/.cache/.eslintcache'
      ), // 设置缓存目录
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, '../public/index.html'),
    }),
    isProduction &&
      new MiniCssExtractPlugin({
        filename: 'static/css/[name].[contenthash:10].css',
        chunkFilename: 'static/css/[name].[contenthash:10].chunk.css',
      }),
    isProduction &&
      new CopyPlugin({
        patterns: [
          {
            from: path.resolve(__dirname, '../public'),
            to: path.resolve(__dirname, '../dist'),
            globOptions: {
              // 忽略html文件
              ignore: ['**/index.html'],
            },
          },
        ],
      }),
    !isProduction && new ReactRefreshWebpackPlugin(),
  ].filter(Boolean),
  mode: isProduction ? 'production' : 'development',
  devtool: isProduction ? 'source-map' : 'cheap-module-source-map',
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        // react react-dom react-router-dom 一起打包成一个文件
        react: {
          test: /[\\/]node_modules[\\/]react(.*)[\\/]/,
          name: 'chunk-react',
          priority: 40,
        },
        // antd单独打包
        antd: {
          test: /[\\/]node_modules[\\/]antd[\\/]/,
          name: 'chunk-antd',
          priority: 30,
        },
        // 剩下的node_modules单独打包
        libs: {
          test: /[\\/]node_modules[\\/]/,
          name: 'chunk-libs',
          priority: 20,
        },
      },
    },
    runtimeChunk: {
      name: (entrypoint) => `runtime~${entrypoint.name}`,
    },
    minimize: isProduction,
    minimizer: [
      new CssMinimizerWebpackPlugin(),
      new TerserWebpackPlugin(),
      new ImageMinimizerPlugin({
        minimizer: {
          implementation: ImageMinimizerPlugin.imageminGenerate,
          options: {
            plugins: [
              ['gifsicle', { interlaced: true }],
              ['jpegtran', { progressive: true }],
              ['optipng', { optimizationLevel: 5 }],
              [
                'svgo',
                {
                  plugins: [
                    'preset-default',
                    'prefixIds',
                    {
                      name: 'sortAttrs',
                      params: {
                        xmlnsOrder: 'alphabetical',
                      },
                    },
                  ],
                },
              ],
            ],
          },
        },
      }),
    ],
  },
  resolve: {
    extensions: ['.jsx', '.js', '.json'],
  },
  devServer: {
    host: 'localhost',
    port: 3000,
    open: true,
    hot: true,
    historyApiFallback: true, // 解决前端路由刷新404的问题
  },
  performance: false, // 关闭性能分析，提升打包速度
}
