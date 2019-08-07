/* @flow */

import {runWithTimeout, TimeoutError, ReturnError} from '../runWithTimeout'
import {delay} from '../common';

it('without timeout', async () => {
    const callback = jest.fn<$ReadOnlyArray<AbortSignal>, Promise<number>>()
        .mockReturnValueOnce(Promise.resolve(1))
    const duration = 100
    const returnController = new AbortController()
    await expect(runWithTimeout(callback, duration, returnController.signal)).resolves.toBe(1)
})

it('with timeout', async () => {
    const callback = jest.fn<$ReadOnlyArray<AbortSignal>, Promise<void>>()
        .mockImplementationOnce(() => delay(100))
    
    const returnController = new AbortController()
    await expect(runWithTimeout(callback, 0, returnController.signal)).rejects.toThrow(TimeoutError)
})

it('with return', async () => {
    const callback = jest.fn<$ReadOnlyArray<AbortSignal>, Promise<void>>()
        .mockImplementationOnce(() => delay(1000))
    
    const returnController = new AbortController()
    expect(runWithTimeout(callback, 500, returnController.signal)).rejects.toThrow(ReturnError)
    returnController.abort()
})
