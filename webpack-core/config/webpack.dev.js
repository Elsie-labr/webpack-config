const path = require('path')
const os = require('os')
const ESLintPlugin = require('eslint-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const threads = os.cpus().length // cpu核数

module.exports = {
  // 入口
  entry: './src/main.js', // 相对路径
  // 输出
  output: {
    path: undefined, // 开发模式没有输出
    filename: 'static/js/main.js', // 输出的文件名(绝对路径)
  },
  // 加载器
  module: {
    rules: [
      // loader的配置
      {
        // oneOf值匹配其中一个loader，不往下继续执行
        oneOf: [
          {
            test: /\.css$/, //检测xxx文件
            use: ['style-loader', 'css-loader'], // 使用的loader配置，执行顺序：从右到左，从下到上
          },
          {
            test: /\.less$/,
            use: ['style-loader', 'css-loader', 'less-loader'], // 将 Less 编译为 CSS
          },
          {
            test: /\.s[ac]ss$/,
            use: [
              'style-loader', // 将 JS 字符串生成为 style 节点
              'css-loader', // 将 CSS 转化成 CommonJS 模块
              'sass-loader', // 将 Sass 编译成 CSS，默认使用 Node Sass
            ],
          },
          {
            test: /\.styl$/,
            use: [
              'style-loader', // 将 JS 字符串生成为 style 节点
              'css-loader', // 将 CSS 转化成 CommonJS 模块
              'stylus-loader', // 将 stylus 编译成 CSS，默认使用 Node Sass
            ],
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
            // exclude: /(node_modules|bower_components)/,
            include: path.resolve(__dirname, '../src'),
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
  // 模式
  mode: 'development',
}
