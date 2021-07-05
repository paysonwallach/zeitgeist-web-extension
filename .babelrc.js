module.exports = {
  presets: [
    [
      // Latest stable ECMAScript features
      "@babel/preset-env",
      {
        useBuiltIns: false,
        // Do not transform modules to CJS
        modules: false,
        targets: {
          chrome: "49",
          firefox: "52",
          opera: "36",
          edge: "79",
        },
      },
    ],
    ["@babel/typescript",
      {
        onlyRemoveTypeImports: true
      }
    ],
    "@babel/react",
  ],
  plugins: [
    [
      "@babel/plugin-proposal-decorators",
      {
        legacy: true
      }
    ],
    [
      "@babel/plugin-proposal-class-properties",
      {
        loose: true
      }
    ],
    [
      "@babel/plugin-proposal-private-methods",
      {
        loose: true
      }
    ],
    "babel-plugin-parameter-decorator",
    "babel-plugin-transform-typescript-metadata",
    [
      "@babel/plugin-transform-destructuring",
      {
        useBuiltIns: true,
      },
    ],
    [
      "@babel/plugin-proposal-object-rest-spread",
      {
        useBuiltIns: true,
      },
    ],
    [
      // Polyfills the runtime needed for async/await and generators
      "@babel/plugin-transform-runtime",
      {
        helpers: false,
        regenerator: true,
      },
    ],
  ],
};
