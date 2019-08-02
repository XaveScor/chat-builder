/* @flow */

export async function runWithTimeout<T>(
    f: (abortController: AbortController) => Promise<T>,
    duration: number,
    abortController?: AbortController,
): Promise<T> {
    const localAbortController = abortController || new AbortController()
    return new Promise((resolve, reject) => {
        let timeout
        if (duration >= 0) {
            timeout = setTimeout(() => {
                localAbortController.abort()
                reject()
            }, duration)
        }

        f(localAbortController)
            .then(resolve)
            .catch(reject)
            .finally(() => {
                clearTimeout(timeout)
            })
    })
}