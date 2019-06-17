// @flow
const path = require('path')
const babelPlugin = require('rollup-plugin-babel')
const resolvePlugin = require('rollup-plugin-node-resolve')

const rootDir = path.resolve(__dirname, '..');

const inputConfig = {
    input: path.resolve(rootDir, 'src', 'index.js'),
    plugins: [babelPlugin(), resolvePlugin()],
}

const outputConfig = {
    file: path.resolve(rootDir, 'dist', 'bundle.js'),
    format: 'esm',
}

module.exports = {
    rootDir,
    inputConfig,
    outputConfig,
}
