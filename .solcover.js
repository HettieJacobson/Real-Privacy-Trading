module.exports = {
  skipFiles: ["mocks/", "test/", "node_modules/"],
  istanbulReporter: ["html", "lcov", "text", "json"],
  providerOptions: {
    mnemonic: "test test test test test test test test test test test junk",
  },
  mocha: {
    timeout: 100000,
  },
};
