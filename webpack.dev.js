const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const express = require('express');
const path = require('path');

module.exports = merge(common, {
    mode: 'development',
    devtool: 'inline-source-map',
    devServer: {
        contentBase: './dist',
        before(app) {
            app.use('/images', express.static(path.resolve('images')));
        }
    }
});
