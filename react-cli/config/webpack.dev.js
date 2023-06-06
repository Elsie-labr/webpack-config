const path = require('path')
const ESLintWebpackPlugin = require('eslint-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin')

const getStyleLoader = (pre) => {
  return [
    'style-loader',
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
        test: /\.jsx?$/,
        include: path.resolve(__dirname, '../src'),
        loader: 'babel-loader',
        options: {
          cacheDirectory: true,
          cacheCompression: false,
          plugins: ['react-refresh/babel'], // 激活js的HMR功能
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
    'development' && new ReactRefreshWebpackPlugin(),
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
    extensions: ['.jsx', '.js', '.json'],
  },
  devServer: {
    host: 'localhost',
    port: 3000,
    open: true,
    hot: true,
    historyApiFallback: true, // 解决前端路由刷新404的问题
  },
}
