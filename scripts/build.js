// @flow
const rollup = require('rollup')

const {inputConfig, outputConfig} = require('./rollup.config')

async function build() {
    const bundle = await rollup.rollup(inputConfig)

    await bundle.write(outputConfig)
}

build().catch(console.error)