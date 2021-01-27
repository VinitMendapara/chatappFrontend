const path = require("path");
const HtmlWebpackPlugin = require('html-webpack-plugin');


// webpack configurations
module.exports = {

    devServer: {
        historyApiFallback: true
    },

    // main file (react)
    entry: {
        index: path.resolve(__dirname, "src", "index.js")
    },

    // compiled output to (path)
    output: {
        path: path.resolve(__dirname, "dist")
    },

    module: {
        rules: [

            // compile all js with babel-loader
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: [
                            "@babel/preset-env",
                            "@babel/preset-react"
                        ],
                        plugins: [
                            [
                                "@babel/plugin-proposal-class-properties"
                            ]
                        ]
                    }
                }
            },

            // compile all css
            {
                test: /\.css$/,
                // exclude: /node_modules/,
                use: ["style-loader", "css-loader"]
            },

            // compile all scss
            {
                test: /\.scss$/,
                exclude: /node_modules/,
                use: ["style-loader", "css-loader", "sass-loader"]
            },

            // import all static assets
            {
                test: /\.(png|jpe?g|gif)$/i,
                use: {
                    loader: 'file-loader',
                    options: {
                        limit: 10000
                    }
                }
            },
        ]
    },


    plugins: [
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, "src", "index.html")// look for this file as html
        })
    ]
}