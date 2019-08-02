/* @flow */

import {runWithTimeout} from '../runWithTimeout'
import {delay} from './common';

it('without timeout', async () => {
    const abortController = new AbortController();
    const callback = jest.fn<$ReadOnlyArray<mixed>, Promise<mixed>>()
        .mockReturnValueOnce(Promise.resolve())
    const duration = 100

    await runWithTimeout(callback, duration, abortController)
    expect(abortController.signal.aborted).toBe(false)

    await delay(duration)
    expect(abortController.signal.aborted).toBe(false)
})

it('with timeout', async () => {
    const abortController = new AbortController();
    const duration = 100
    const callback = jest.fn<$ReadOnlyArray<mixed>, Promise<mixed>>()
        .mockImplementationOnce(async () => {
            await delay(duration * 10)
        })

    expect(() => runWithTimeout(callback, duration, abortController)).toThrow()
    expect(abortController.signal.aborted).toBe(true)
})