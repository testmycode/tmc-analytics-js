const webpack = require('webpack')
const path = require('path')
const resolve = path.resolve


module.exports = env => {
  return {
    entry: './src/index.js',
    output: {
      path: resolve('.'),
      filename: 'tmc-analytics' + (env.prod ? '.min.js' : '.js'),
      library: 'TmcAnalytics' ,
      libraryTarget: 'umd'
    },
    module: {
      loaders: [
      { test: /(\.jsx|\.js)$/, loader: 'babel!eslint', exclude: /(node_modules|bower_components)/ },
      { test: /(\.jsx|\.js)$/, loader: "eslint-loader", exclude: /node_modules/ }
      ]
    },
    resolve: {
      root: path.resolve('./src'),
      extensions: ['', '.js']
    },
    plugins: [
      env.prod ? undefined : webpack.optimize.UglifyJsPlugin({minimize: true})
    ].filter(p => !!p),
    devtool: 'source-map',
  }
}

