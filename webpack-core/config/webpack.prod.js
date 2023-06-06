const path = require('path')
const os = require('os')
const ESLintPlugin = require('eslint-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const TerserWebpackPlugin = require('terser-webpack-plugin')
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin')

const threads = os.cpus().length // cpu核数

function getStyleLoader(pre) {
  return [
    MiniCssExtractPlugin.loader,
    'css-loader',
    {
      loader: 'postcss-loader',
      options: {
        postcssOptions: {
          plugins: ['postcss-preset-env'],
        },
      },
    },
    pre,
  ].filter(Boolean)
}

module.exports = {
  // 入口
  entry: './src/main.js', // 相对路径
  // 输出
  output: {
    path: path.resolve(__dirname, '../dist'), // 文件的输出路径(绝对路径)
    filename: 'static/js/main.js', // 输出的文件名(绝对路径)
    clean: true, // 自动清空上次打包结果
  },
  // 加载器
  module: {
    rules: [
      // loader的配置
      {
        oneOf: [
          {
            test: /\.css$/, //检测xxx文件
            use: getStyleLoader(), // 使用的loader配置，执行顺序：从右到左，从下到上
          },
          {
            test: /\.less$/,
            use: getStyleLoader('less-loader'), // 将 Less 编译为 CSS
          },
          {
            test: /\.s[ac]ss$/,
            use: getStyleLoader('sass-loader'),
          },
          {
            test: /\.styl$/,
            use: getStyleLoader('stylus-loader'),
          },
          {
            test: /\.(png|jpe?g|gif|webp|svg)$/,
            type: 'asset',
            parser: {
              dataUrlCondition: {
                // 小于10kb的图片转成base64
                // 优点：减少图片请求  缺点：体积会更大
                maxSize: 10 * 1024, // 10kb
              },
            },
            generator: {
              // 输出图片的名称
              // [hash:10] hash取前10位
              filename: 'static/images/[hash:10][ext][query]',
            },
          },
          {
            test: /\.(ttf|woff2?)$/,
            type: 'asset/resource', // 将文件原封不动的打包，不做任何处理
            generator: {
              // [hash:10] hash取前10位
              filename: 'static/font/[hash:10][ext][query]',
            },
          },
          {
            test: /\.m?js$/,
            exclude: /(node_modules|bower_components)/,
            use: [
              {
                loader: 'thread-loader', // 开启多进程
                options: {
                  works: threads, // 进程数量
                },
              },
              {
                loader: 'babel-loader',
                options: {
                  cacheDirectory: true, // 开启babel缓存
                  cacheCompression: false, // 关闭缓存文件压缩
                  plugins: ['@babel/plugin-transform-runtime'], // 减少代码体积
                },
              },
            ],
          },
        ],
      },
    ],
  },
  // 插件
  plugins: [
    new ESLintPlugin({
      // 检测哪些路径
      context: path.resolve(__dirname, '../src'),
      cache: true, // 开启缓存
      cacheLocation: path.resolve(
        __dirname,
        '../node_modules/.cache/eslintcache' // 设置缓存目录
      ),
      threads, // 开启多进程和设置进程数量
    }),
    new HtmlWebpackPlugin({
      // 以view/index.html文件为模板创建新的html文件
      // 新的文件有两个特点：
      // 1 结构和原来的一致 2 自动引入打包的资源
      template: path.resolve(__dirname, '../src/view/index.html'),
    }),
  ],
  devServer: {
    host: 'localhost',
    port: 9999,
    open: true,
  },
  optimization: {
    minimizer: [
      new MiniCssExtractPlugin({
        filename: 'static/css/main.css',
      }),
      new TerserWebpackPlugin({
        parallel: threads, // // 开启多进程和设置进程数量
      }),
      // 压缩图片
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
  // 模式
  mode: 'production',
  devtool: 'source-map', // 检查错误代码映射
}
