export async function runWithTimeout<T>(f: () => Promise<T>, duration: number): Promise<T> {
    return new Promise((resolve, reject) => {
        let resolved = false;
        if (duration >= 0) {
            setTimeout(() => {
                if (!resolved) {
                    resolved = true;
                    reject()
                }
            }, duration)
        }

        f().then(resolve).catch(reject)
    })
}