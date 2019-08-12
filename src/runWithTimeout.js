/* @flow */
import type {EventType} from './event'

export class TimeoutError extends Error {}

export class ReturnError extends Error {}

export async function runWithTimeout<T>(
    f: (abortSignal: AbortSignal) => Promise<T>,
    duration: number,
    breakEvent: EventType<void>,
): Promise<T> {
    const abortController = new AbortController()
    const {signal} = abortController
    return new Promise((resolve, reject) => {
        let timeout
        if (duration >= 0) {
            timeout = setTimeout(() => {
                abortController.abort()
                reject(new TimeoutError())
            }, duration)
        }

        breakEvent.watch(() => {
            abortController.abort()
            reject(new ReturnError())
        })

        f(signal)
            .then(resolve)
            .catch(reject)
            .finally(() => {
                clearTimeout(timeout)
            })
    })
}