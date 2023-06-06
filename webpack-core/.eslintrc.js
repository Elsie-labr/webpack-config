module.exports = {
  env: {
    node: true, // 启动node中全局变量
    browser: true, // 启用浏览器中的全局变量
  },
  extends: ['eslint:recommended'],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  rules: {
    'no-var': 2, // 不能使用var定义的变量
  },
}
