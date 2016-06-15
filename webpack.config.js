var webpack = require('webpack');
var UglifyJsPlugin = webpack.optimize.UglifyJsPlugin;
var path = require('path');
var env = require('yargs').argv.mode;

var libraryName = 'TmcAnalytics';

var plugins = [], outputFile;

if (env === 'build') {
  plugins.push(new UglifyJsPlugin({ minimize: true }));
  outputFileExtension = '.min.js';
} else {
  outputFileExtension = '.js';
}

var config = {
  entry: __dirname + '/src/index.js',
  devtool: 'source-map',
  output: {
    path: __dirname + '/',
    filename: 'tmc-analytics' + outputFileExtension,
    library: libraryName ,
    libraryTarget: 'umd'
  },
  module: {
    loaders: [
      {
        test: /(\.jsx|\.js)$/,
        loader: 'babel',
        exclude: /(node_modules|bower_components)/,
        query: {
          presets: ['es2015'],
          plugins: ['transform-runtime']
        }
      },
      {
        test: /(\.jsx|\.js)$/,
        loader: "eslint-loader",
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    root: path.resolve('./src'),
    extensions: ['', '.js']
  },
  plugins: plugins
};

module.exports = config;
