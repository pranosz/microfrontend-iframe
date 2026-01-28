// webpack.config.js
module.exports = {
  mode: "production",
  entry: "./src/root-config.tsx", // albo src/index.tsx
  output: {
    filename: "my-app.js",
    path: __dirname + "/dist",
    library: {
      type: "module",
    },
    publicPath: "auto",
  },
  experiments: {
    outputModule: true,
  },
};
