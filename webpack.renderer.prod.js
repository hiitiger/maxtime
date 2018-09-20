/**
 * Build config for electron 'Renderer Process' file
 */

const path = require("path")
const webpack = require('webpack');

module.exports = {
    devtool: 'cheap-module-source-map',

    entry: [
        './src/renderer/main.ts'
    ],

    output: {
        filename: "renderer.js",
        path: __dirname + "/dist/renderer",
    },

    resolve: {
        // Add '.ts' and '.tsx' as resolvable extensions.
        extensions: [".ts", ".tsx", ".js", ".json"],
    },

    module: {
        rules: [
            // All files with a '.ts' or '.tsx' extension will be handled by 'awesome-typescript-loader'.
            {
                test: /\.tsx?$/,
                include: [
                    path.resolve(__dirname, 'src/renderer')
                ],
                use: [{
                    loader: 'awesome-typescript-loader',
                    options: {
                        configFileName: "tsconfig.renderer.json"
                    }
                }]
            },

            // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
            {
                enforce: "pre",
                test: /\.js$/,
                loader: "source-map-loader"
            },

            {
                test: /\.css$/,
                loader: ["style-loader", "css-loader?modules=true"]
            },
            {
                test: /\.(png|woff|woff2|eot|ttf|svg)$/,
                loader: 'url-loader?limit=100000'
            }
        ]
    },

    // When importing a module whose path matches one of the following, just
    // assume a corresponding global variable exists and use that instead.
    // This is important because it allows us to avoid bundling all of our
    // dependencies, which allows browsers to cache those libraries between builds.
    // externals: {
    //     "react": "React",
    //     "react-dom": "ReactDOM"
    // },

    // https://github.com/chentsulin/webpack-target-electron-renderer#how-this-module-works
    target: 'electron-renderer',

    mode: 'production'
};