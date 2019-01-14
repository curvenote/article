const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const webpack = require('webpack');

module.exports = {
    optimization: {
        usedExports: true
    },
    entry: {
        app: './src/index.js',
    },
    plugins: [
        new CleanWebpackPlugin(['dist']),
        new HtmlWebpackPlugin({
            title: 'Main page',
            template: 'index.html'
        }),
        // new webpack.HotModuleReplacementPlugin()
    ],
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    module: {
      rules: [
        {
            test: /\.css$/,
            use: [
                'style-loader',
                'css-loader'
            ]
        },
        {
            test: /\.(png|svg|jpg|gif)$/,
            use: [
                'file-loader'
            ]
        },
        // {
        //     test: /\.tsx?$/,
        //     use: 'ts-loader',
        //     exclude: /node_modules/
        // }
      ]
    },
    // resolve: {
    //     extensions: [ '.tsx', '.ts', '.js' ]
    // },
};
