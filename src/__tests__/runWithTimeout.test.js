/* @flow */

import { runWithTimeout, TimeoutError, ReturnError } from '../runWithTimeout'
import { delay } from '../common'
import { createEvent } from '../event'

it('without timeout', async () => {
	const callback = jest.fn<$ReadOnlyArray<AbortSignal>, Promise<number>>().mockReturnValueOnce(Promise.resolve(1))
	const duration = 100
	const breakEvent = createEvent<void>()
	await expect(runWithTimeout(callback, duration, breakEvent)).resolves.toBe(1)
})

it('with timeout', async () => {
	const callback = jest.fn<$ReadOnlyArray<AbortSignal>, Promise<void>>().mockImplementationOnce(() => delay(100))

	const breakEvent = createEvent<void>()
	await expect(runWithTimeout(callback, 0, breakEvent)).rejects.toThrow(TimeoutError)
})

it('with return', async () => {
	const callback = jest.fn<$ReadOnlyArray<AbortSignal>, Promise<void>>().mockImplementationOnce(() => delay(1000))

	const breakEvent = createEvent<void>()
	expect(runWithTimeout(callback, 500, breakEvent)).rejects.toThrow(ReturnError)
	breakEvent()
})
