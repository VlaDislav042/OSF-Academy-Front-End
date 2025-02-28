/* global process, __dirname */

const fse = require("fs-extra");
const glob = require("glob");
const path = require("path");
const chalk = require("chalk");
const minimatch = require("minimatch");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const autoprefixer = require("autoprefixer");
const pkg = require("./package.json");

class MiniCssExtractPluginCleanup {
    apply(compiler) {
        compiler.hooks.compilation.tap("MiniCssExtractPluginCleanup", (compilation) => {
            compilation.hooks.afterProcessAssets.tap("MiniCssExtractPluginCleanup", () => {
                Object.keys(compilation.assets)
                    .filter((asset) => {
                        return ["*/css/**/*.js", "*/css/**/*.js.map"].some((pattern) => {
                            return minimatch(asset, pattern);
                        });
                    })
                    .forEach((asset) => {
                        delete compilation.assets[asset];
                    });
            });
        });
    }
}

function getJSBundle(env, cartridge) {
    const clientPath = path.resolve(__dirname, "cartridges", cartridge, "cartridge/client");
    if (!fse.existsSync(clientPath)) {
        console.error(`${chalk.red.bold("[ERROR] \u2716")} clientPath=${clientPath} does not exist!`);
        process.exit(1);
    }

    const bundle = {};

    if (env.production) {
        bundle.mode = "production";
    } else {
        bundle.mode = "development";
        bundle.devtool = false;
    }

    bundle.entry = {};
    glob.sync(path.resolve(clientPath, "*", "js", "*.js")).forEach((f) => {
        const key = path.join(path.dirname(path.relative(clientPath, f)), path.basename(f, ".js"));
        bundle.entry[key] = f;
    });

    if (Object.keys(bundle.entry).length === 0) {
        console.warn(`${chalk.yellow.bold("[WARNING] \u2716")} No JS files to compile for cartridge=${cartridge}!`);
        return;
    }

    bundle.output = {
        path: path.resolve(__dirname, "cartridges", cartridge, "cartridge/static"),
        filename: "[name].js",
    };

    bundle.module = {
        rules: [
            {
                test: /\\.(js|jsx)$/,
                use: [
                    {
                        loader: "babel-loader",
                        options: {
                            compact: false,
                            babelrc: false,
                            cacheDirectory: true,
                            presets: ["@babel/preset-env"],
                            // See https://babeljs.io/docs/en/plugins-list
                            plugins: ["@babel/plugin-proposal-object-rest-spread"],
                        },
                    },
                ],
            },
        ],
    };

    bundle.plugins = [
        new CleanWebpackPlugin({
            cleanOnceBeforeBuildPatterns: [path.resolve(__dirname, "cartridges", cartridge, "cartridge/static/*/js")],
            cleanAfterEveryBuildPatterns: [],
        }),
    ].filter(Boolean);

    bundle.optimization = { minimizer: [new TerserPlugin()] };

    if (pkg.aliasJS) {
        const alias = {};
        Object.entries(pkg.aliasJS).forEach(([key, value]) => {
            alias[key] = path.resolve(__dirname, value);
        });

        bundle.resolve = { alias };
    }

    return bundle;
}

function getCSSBundle(env, cartridge) {
    const clientPath = path.resolve(__dirname, "cartridges", cartridge, "cartridge/client");
    if (!fse.existsSync(clientPath)) {
        console.error(`${chalk.red.bold("[ERROR] \u2716")} clientPath=${clientPath} does not exist!`);
        process.exit(1);
    }

    const bundle = {};

    if (env.production) {
        bundle.mode = "production";
    } else {
        bundle.mode = "development";
        bundle.devtool = false;
    }

    bundle.entry = {};
    glob.sync(path.resolve(clientPath, "*", "scss", "**", "*.scss"))
        .filter((f) => !path.basename(f).startsWith("_"))
        .forEach((f) => {
            const key = path
                .join(path.dirname(path.relative(clientPath, f)), path.basename(f, ".scss"))
                .split(path.sep)
                .map((pPart, pIdx) => (pIdx === 1 && pPart === "scss" ? "css" : pPart))
                .join(path.sep);

            bundle.entry[key] = f;
        });

    if (Object.keys(bundle.entry).length === 0) {
        console.warn(`${chalk.yellow.bold("[WARNING] \u2716")} No SCSS files to compile for cartridge=${cartridge}!`);
        return;
    }

    bundle.output = {
        path: path.resolve(__dirname, "cartridges", cartridge, "cartridge/static"),
        filename: "[name].js",
    };

    bundle.module = {
        rules: [
            {
                test: /\.s[ac]ss$/i,
                use: [
                    { loader: MiniCssExtractPlugin.loader },
                    { loader: "css-loader", options: { url: false } },
                    {
                        loader: "postcss-loader",
                        options: {
                            postcssOptions: {
                                plugins: [autoprefixer],
                            },
                        },
                    },
                    { loader: "sass-loader" },
                ],
            },
            {
                test: /\.css$/i,
                use: [
                    { loader: MiniCssExtractPlugin.loader },
                    { loader: "css-loader", options: { url: false } },
                    {
                        loader: "postcss-loader",
                        options: {
                            postcssOptions: {
                                plugins: [autoprefixer],
                            },
                        },
                    },
                ],
            },
        ],
    };

    bundle.plugins = [
        new CleanWebpackPlugin({
            cleanOnceBeforeBuildPatterns: [path.resolve(__dirname, "cartridges", cartridge, "cartridge/static/*/css")],
            cleanAfterEveryBuildPatterns: [],
        }),
        new MiniCssExtractPlugin(),
        new MiniCssExtractPluginCleanup(),
        // bm_smartorderrefill using local libs so we need to copy them to static
        (cartridge === "bm_smartorderrefill") ? new CopyPlugin({
            patterns: [
                {
                    from: path.resolve(__dirname, "cartridges", cartridge, "cartridge", "client", "default", "lib", "css"),
                    to: path.resolve(__dirname, "cartridges", cartridge, "cartridge", "static", "default", "css")
                }
            ]
        }) : null
    ].filter(Boolean);

    bundle.optimization = {
        minimizer: [
            new CssMinimizerPlugin({
                minimizerOptions: {
                    preset: [
                        "default",
                        {
                            discardComments: { removeAll: true },
                        },
                    ],
                },
            }),
        ],
    };

    if (pkg.aliasCSS) {
        const alias = {};
        Object.entries(pkg.aliasCSS).forEach(([key, value]) => {
            alias[key] = path.resolve(__dirname, value);
        });

        bundle.resolve = { alias };
    }

    return bundle;
}

module.exports = (env, _argv) => {
    if (!pkg.cartridges) {
        console.error(`${chalk.red.bold("[ERROR] \u2716")} package.json does not contain the "cartridges" entry!`);
        process.exit(1);
    }

    const configurations = [];
    let cartridgeBundle;
    pkg.cartridges.forEach((cartridge) => {
        cartridgeBundle = getJSBundle(env, cartridge);
        cartridgeBundle && configurations.push(cartridgeBundle);
        cartridgeBundle = getCSSBundle(env, cartridge);
        cartridgeBundle && configurations.push(cartridgeBundle);
    });
    return configurations;
};
