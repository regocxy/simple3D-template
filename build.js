let webpack = require("webpack");
let webpackDevMiddleware = require("webpack-dev-middleware");
let express = require("express");
let path = require("path");
let open = require("open");

let webpackConfig = {
    devtool: "inline-source-map",
    entry: {
        "001_box": "./demo/001_box.ts",
    },
    output: { path: path.resolve(__dirname, "./"), filename: "[name].js" },
    module: {
        rules: [
            { test: /\.tsx?$/, loader: "ts-loader" },
        ]
    },
    resolve: {
        extensions: [".js", ".ts"],
    },
    mode: "none"
}

let app = express();
app.use(express.static("./demo"));
app.use(webpackDevMiddleware(webpack(webpackConfig), { publicPath: "" }));
app.listen(3002, function () { open(`http://localhost:3002`) });
