const { defineConfig } = require('@vscode/test-cli');

module.exports = defineConfig({
    files: 'out/test/**/*.test.js',
    version: 'stable',
    mocha: {
        ui: 'bdd', // Use 'tdd' if your tests use suite() and test() instead of describe()
        timeout: 10000,
        color: true
    }
});