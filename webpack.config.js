const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const path = require('path');

module.exports = {
  devServer: {
    contentBase: './build',
  },
  devtool: 'cheap-module-eval-source-map',
  entry: './src/index.js',
  module: {
    rules: [
      {
        exclude: /node_modules/,
        test: /\.jsx?$/,
        use: ['babel-loader', 'eslint-loader'],
      },
      {
        test: /\.s?css$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: { sourceMap: true, url: false },
          },
          {
            loader: 'sass-loader',
            options: { sourceMap: true },
          },
        ],
      },
    ],
  },
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'build'),
  },
  plugins: [
    new HtmlWebpackPlugin({
      meta: {
        viewport: 'width=device-width, initial-scale=1, shrink-to-fit=no',
      },
      title: 'Tetris',
    }),
    new MiniCssExtractPlugin({ filename: 'styles.css' }),
  ],
  resolve: {
    alias: {
      enums: path.resolve(__dirname, 'src/enums/'),
      models: path.resolve(__dirname, 'src/models/'),
    },
    extensions: ['.js', '.jsx'],
  },
};
