const path = require('path')
const { DefinePlugin } = require('webpack')
const ESLintWebpackPlugin = require('eslint-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { VueLoaderPlugin } = require('vue-loader')

const getStyleLoader = (pre) => {
  return [
    'vue-style-loader',
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
    path: undefined,
    filename: 'static/js/[name].js',
    chunkFilename: 'static/js/[name].chunk.js',
    assetModuleFilename: 'static/media/[hash:10][ext][query]',
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
        test: /\.js?$/,
        include: path.resolve(__dirname, '../src'),
        loader: 'babel-loader',
        options: {
          cacheDirectory: true,
          cacheCompression: false,
        },
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader',
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
    new VueLoaderPlugin(),
    // cross-env定义的环境变量是给打包工具使用的
    // DefinePlugin 定义的环境变是给源代码使用的，从而清楚警告
    new DefinePlugin({
      __VUE_OPTIONS_API__: true,
      __VUE_PROD_DEVTOOLS__: false,
    }),
  ],
  mode: 'development',
  devtool: 'cheap-module-source-map',
  optimization: {
    splitChunks: {
      chunks: 'all',
    },
    runtimeChunk: {
      name: (entrypoint) => `runtime~${entrypoint.name}`,
    },
  },
  resolve: {
    extensions: ['.vue', '.js', '.json'],
  },
  devServer: {
    host: 'localhost',
    port: 3000,
    open: true,
    hot: true,
    historyApiFallback: true, // 解决前端路由刷新404的问题
  },
}
