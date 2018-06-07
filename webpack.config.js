const webpack = require('webpack')
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const DashboardPlugin = require('webpack-dashboard/plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const nodeEnv = process.env.NODE_ENV || 'development'
const isProd = nodeEnv === 'production'

const plugins = [
  new webpack.DefinePlugin({
    'process.env': {
      // eslint-disable-line quote-props
      NODE_ENV: JSON.stringify(nodeEnv)
    }
  }),
  new webpack.ProvidePlugin({
    jQuery: 'jquery',
    $: 'jquery',
    Popper: 'popper.js'
  }),
  new HtmlWebpackPlugin({
    title: 'SDK DApp Example',
    template: '!!ejs-loader!src/index.html'
  }),
  new webpack.optimize.CommonsChunkPlugin({
    name: 'vendor',
    minChunks: Infinity,
    filename: 'vendor.bundle.js'
  }),
  new webpack.LoaderOptionsPlugin({
      options: {
          tslint: {
              emitErrors: true,
              failOnHint: true
          }
      }
  }),
  new ExtractTextPlugin('./dist/css/[name].css'),
];

if (!isProd) {
  plugins.push(new DashboardPlugin());
}

var config = {
  devtool: isProd ? 'hidden-source-map' : 'source-map',
  context: path.resolve('./src'),
  entry: {
    app: './index.ts',
    appStyles: [
      './sass/index.scss',
    ],
    vendor: './vendor.ts'
  },
  output: {
    path: path.resolve('./dist'),
    filename: '[name].bundle.js',
    sourceMapFilename: '[name].bundle.map',
    devtoolModuleFilenameTemplate: function(info) {
      return 'file:///' + info.absoluteResourcePath
    }
  }, 
  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.ts?$/,
        exclude: ['node_modules'],
        use: ['awesome-typescript-loader', 'source-map-loader']
      },
      {
        test: /\.(js|ts)$/,
        loader: 'istanbul-instrumenter-loader',
        exclude: [/\/node_modules\//],
        query: {
          esModules: true
        }
      },
      { test: /\.html$/, loader: 'html-loader' },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
      {
        test: /\.scss$/,
        exclude: /node_modules/,
        loader: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            { loader: 'css-loader', },
            { loader: 'sass-loader', },
          ],
        }),
      },
      {
        test: /\.css$/,
        include: /node_modules/,
        loader: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: {
            loader: 'css-loader',
          },
        }),
      },
      { test: /\.json$/, loader: 'json-loader' }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  plugins: plugins,
  devServer: {
    contentBase: path.join(__dirname, 'dist/'),
    compress: true,
    port: 3000,
    hot: true
  },
  node: {
    console: true,
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
  }
}

module.exports = config
