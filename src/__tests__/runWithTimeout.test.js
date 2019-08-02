/* @flow */

import {runWithTimeout, TimeoutError} from '../runWithTimeout'
import {delay} from './common';

it('without timeout', async () => {
    const callback = jest.fn<$ReadOnlyArray<AbortSignal>, Promise<number>>()
        .mockReturnValueOnce(Promise.resolve(1))
    const duration = 100

    await expect(runWithTimeout(callback, duration)).resolves.toBe(1)
})

it('with timeout', async () => {
    const callback = jest.fn<$ReadOnlyArray<AbortSignal>, Promise<void>>()
        .mockImplementationOnce(() => delay(100))

    await expect(runWithTimeout(callback, 0)).rejects.toThrow(TimeoutError)
})
