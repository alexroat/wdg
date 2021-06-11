const path = require('path');
const webpack = require('webpack')

module.exports = {
    entry: [
        'jquery',
        './src/clapp.js', ],
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'client/dist'),
    },

    module: {
        rules: [
            {
                test: /\.(js)$/,
                exclude: /node_modules/,
                use: ['babel-loader']
            },
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.(gif|svg|jpg|png)$/,
                loader: "file-loader"
            },
        ]
    },
    resolve: {
        extensions: ['*', '.js'],
        fallback: {
            "fs": false,
            "tls": false,
            "net": false,
            "path": false,
            "zlib": false,
            "http": false,
            "https": false,
            //"stream": false,
            "crypto": false,
            "path": false,
            "os": false,
            //"crypto-browserify": require.resolve('crypto-browserify'), //if you want to use this module also don't forget npm i crypto-browserify 
            //"assert": require.resolve("assert/"),
            //"os": require.resolve("os-browserify/browser"),
            //"process": require.resolve('process'),
            "stream": require.resolve("stream-browserify"),
        },
        //alias: {
        //    process: "process/browser"
        //},
    },
    plugins: [
        // fix "process is not defined" error:
        // (do "npm install process" before running the build)
        new webpack.ProvidePlugin({
            process: 'process/browser',
        }),
        new webpack.ProvidePlugin({
            Buffer: ['buffer', 'Buffer'],
        }),
        new webpack.SourceMapDevToolPlugin({})
    ],
    mode: "development",
    devtool: false,
};