/* @flow */
export class TimeoutError extends Error {
    constructor(message?: string) {
        super(message)
    }
}

export async function runWithTimeout<T>(
    f: (abortSignal: AbortSignal) => Promise<T>,
    duration: number,
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

        f(signal)
            .then(resolve)
            .catch(reject)
            .finally(() => {
                clearTimeout(timeout)
            })
    })
}