const WebPackHook = require('./scripts/plugin')
const fse = require('fs-extra')
const path = require('path')
const merge = require('webpack-merge')
const baseConfig = require('./base.webpack')

//压缩代码
const TerserPlugin = require('terser-webpack-plugin')
const PrepackWebpackPlugin = require('prepack-webpack-plugin').default;
const ModuleConcatenationPlugin = require('webpack/lib/optimize/ModuleConcatenationPlugin');

//可视化视图查看器
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

let resolve = subPath => { return path.resolve(__dirname, subPath || '') }

const prodConfig = {
  mode: 'production',
  optimization: {
    // splitChunks: {
    //   chunks: 'all',
    //   maxAsyncRequests: 5, // 最大异步请求数， 默认5
    //   maxInitialRequests: 3, // 最大初始化请求书，默认3
    //   automaticNameDelimiter: '~' // 打包分隔符
    // },
    minimizer: [  new TerserPlugin({
      parallel: true,
      terserOptions: {
        // ecma: 5,
        compress: {
          // 在UglifyJs删除没有用到的代码时不输出警告
          warnings: false,
          // 删除所有的 `console` 语句，可以兼容ie浏览器
          drop_console: true,
          // 内嵌定义了但是只用到一次的变量
          collapse_vars: true,
          // 提取出出现多次但是没有定义成变量去引用的静态值
          reduce_vars: true,
        },
        output: {
          comments: false,
          // 最紧凑的输出
          beautify: false,
        },
      },
      warningsFilter: (warning, source, file) => {
        return false;
      }
    })],
  },
  plugins: [
    new WebPackHook({
      beforeRun: compiler => {
        console.log('\n empty dist directory begin')
        fse.emptyDirSync(path.resolve('./dist'))
        fse.emptyDirSync(path.resolve('./.cache'))
        console.log('\n empty dist directory done')
      },
      run: compiler => {
        console.log('\n copy ing ......')
        let srcFolder = resolve('./sdk')
        let destFolder = resolve('./dist/sdk/')
        fse.copy(srcFolder, destFolder, {}, err => {
          if (err) {
            return console.error(err)
          }
          console.log(`\n ${srcFolder} => ${destFolder}`)
        })
      }
    }),
    // 开启 Scope Hoisting
    new ModuleConcatenationPlugin(),
    // new BundleAnalyzerPlugin()
  ]
}
module.exports = merge(baseConfig, prodConfig)
