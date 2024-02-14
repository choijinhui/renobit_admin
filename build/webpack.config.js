const path = require('path');
const utils = require('./utils');
const webpack = require('webpack');
const config = require('../config');
const merge = require('webpack-merge');
const baseWebpackConfig = require('./webpack.base.conf');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const childProcess = require('child_process');

let root_path = path.resolve(__dirname, './bundle');

let path_config = {
    development: {
        index: {
            path: './index.html',
            options: {}
        }
    },
    production:{
        index:{
            path:'./jsp/manager/manager.jsp',
            options: {
                script: '<script>window.user_id = \'${userId}\';window.error = \'${ERROR_CODE}\';</script>',
                jsp:'<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>',
                trialExpire: '<%String trialExpire = (String) session.getAttribute("EXPIRATION_DATE_APPROACH");%><%if(trialExpire != null && trialExpire.equals("Y")){ %><%@ include file="../lib/licenseNoti.jsp" %><%}%>'
            }
        }
    },
}

let webpackConfig = merge(baseWebpackConfig, {
    watch: process.env.NODE_ENV === 'development',
    output: {
        path: path.resolve(root_path, './'),
        publicPath: '',
        filename: 'admin/static/js/[name].js',
        chunkFilename: 'admin/static/js/[id].js'
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new UglifyJsPlugin({
            uglifyOptions: {
                compress: {
                    warnings: false
                }
            },
            sourceMap: config.build.productionSourceMap,
            parallel: true
        }),
        // extract css into its own file
        new ExtractTextPlugin({
            filename: 'admin/static/css/[name].css',
            // Setting the following option to `false` will not extract CSS from codesplit chunks.
            // Their CSS will instead be inserted dynamically with style-loader when the codesplit chunk has been loaded by webpack.
            // It's currently set to `true` because we are seeing that sourcemaps are included in the codesplit bundle as well when it's `false`,
            // increasing file size: https://github.com/vuejs-templates/webpack/issues/1110
            allChunks: true,
        }),
        // Compress extracted CSS. We are using this plugin so that possible
        // duplicated CSS from different components can be deduped.
        new OptimizeCSSPlugin({
            cssProcessorOptions: config.build.productionSourceMap ? { safe: true, map: { inline: false } } : { safe: true }
        }),
        // generate dist index.html with correct asset hash for caching.
        // you can customize output by editing /index.html
        // see https://github.com/ampedandwired/html-webpack-plugin
        new HtmlWebpackPlugin({
            config: path_config[process.env.NODE_ENV].index.options,
            filename: path_config[process.env.NODE_ENV].index.path,
            template: path.resolve(__dirname, '../index.ejs'),
            inject: true,
            minify: {
                removeComments: false,
                collapseWhitespace: false,
                removeAttributeQuotes: false
                    // more options:
                    // https://github.com/kangax/html-minifier#options-quick-reference
            },
            // necessary to consistently work with multiple chunks via CommonsChunkPlugin
            chunksSortMode: 'dependency'
        }),
        // keep module.id stable when vendor modules does not change
        new webpack.HashedModuleIdsPlugin(),
        // enable scope hoisting
        new webpack.optimize.ModuleConcatenationPlugin(),
        // split vendor js into its own file
        new webpack.optimize.CommonsChunkPlugin({
            name: 'vendor',
            minChunks(module) {
                // any required modules inside node_modules are extracted to vendor
                return (
                    module.resource &&
                    /\.js$/.test(module.resource) &&
                    module.resource.indexOf(
                        path.join(__dirname, '../node_modules')
                    ) === 0
                )
            }
        }),
        // extract webpack runtime and module manifest to its own file in order to
        // prevent vendor hash from being updated whenever app bundle is updated
        new webpack.optimize.CommonsChunkPlugin({
            name: 'manifest',
            minChunks: Infinity
        }),
        // This instance extracts shared chunks from code splitted chunks and bundles them
        // in a separate chunk, similar to the vendor chunk
        // see: https://webpack.js.org/plugins/commons-chunk-plugin/#extra-async-commons-chunk
        new webpack.optimize.CommonsChunkPlugin({
            name: 'app',
            async: 'vendor-async',
            children: true,
            minChunks: 3
        }),

        // copy custom static assets
        new CopyWebpackPlugin([{
            from: path.resolve(__dirname, '../static'),
            to: './admin/static',
            ignore: ['.*']
        }]),
        new webpack.BannerPlugin({
            banner: `
                Build Date : ${new Date().toLocaleString()}
                Commit Version : ${childProcess.execSync('git rev-parse --short HEAD')}
                Author: ${childProcess.execSync('git config user.name')}
              `
        })
    ]
})

if (config.build.productionGzip) {
    const CompressionWebpackPlugin = require('compression-webpack-plugin')

    webpackConfig.plugins.push(
        new CompressionWebpackPlugin({
            asset: '[path].gz[query]',
            algorithm: 'gzip',
            test: new RegExp(
                '\\.(' +
                config.build.productionGzipExtensions.join('|') +
                ')$'
            ),
            threshold: 10240,
            minRatio: 0.8
        })
    )
}

if (config.build.bundleAnalyzerReport) {
    const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
    webpackConfig.plugins.push(new BundleAnalyzerPlugin())
}

if(process.env.NODE_ENV === 'development') {
    webpackConfig["devtool"] = 'eval-source-map'
}

module.exports = merge(webpackConfig, { module: { rules: utils.styleLoaders({ sourceMap: true, extract: true, usePostCSS: true }) } });
