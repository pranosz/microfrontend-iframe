const path = require("path");

module.exports = (env = {}) => {
  const isStandalone = env.standalone;

  return {
    mode: "production",

    entry: isStandalone
      ? "./src/standalone.tsx"
      : "./src/cto-platform-support.tsx",

    output: {
      path: path.resolve(__dirname, "dist"),
      filename: "cto-platform-support.js",

      // 🔥 KLUCZOWE
      library: {
        type: "module",
      },

      clean: true,
      publicPath: "",
    },

    experiments: {
      outputModule: true, // 🔥 BEZ TEGO NIE MA ESM
    },

    externals: {
      react: "react",
      "react-dom": "react-dom",
      "single-spa": "single-spa",
    },

    resolve: {
      extensions: [".ts", ".tsx", ".js"],
    },

    module: {
      rules: [
        {
          test: /\.(ts|tsx)$/,
          use: "ts-loader",
          exclude: /node_modules/,
        },
      ],
    },
  };
};


<script src="https://cdn.jsdelivr.net/npm/systemjs@6/dist/system.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/systemjs@6/dist/extras/amd.min.js"></script>