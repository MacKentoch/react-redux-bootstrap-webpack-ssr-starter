const path              = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const nodeExternals     = require('webpack-node-externals');

const nodeModulesDir  = path.join(__dirname, 'node_modules');
const indexFile       = path.join(__dirname, 'src/server/SSR/src/server.js');
const publicPath      = path.join(__dirname, 'docs/public');
const ouputDirectory  = path.join(__dirname, 'src/server/SSR');
const outputFile      = 'index.js';


const serverConfig = {
  entry: indexFile,
  externals:  [nodeExternals()],
  output: {
    path:           ouputDirectory,
    filename:       outputFile,
    publicPath:     publicPath,
    libraryTarget:  'commonjs2'
  },
  target: 'node',
  node: {
    __filename: true,
    __dirname:  true
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: nodeModulesDir,
        loader: 'babel'
      },
      {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract('style-loader', 'css-loader')
      },
      {
        test: /\.scss$/,
        loader: ExtractTextPlugin.extract('style-loader', 'css-loader')
      },
      {
        test: /\.json$/,
        loader: 'json'
      },
      {
        test: /\.(eot|woff|woff2|ttf|svg|png|jpe?g|gif)(\?\S*)?$/,
        loader: 'url?limit=100000&name=[name].[ext]'
      }
    ]
  }
};

module.exports = serverConfig;
