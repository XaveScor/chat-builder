/* @flow */

export function areEqualShallow<T>(a: T, b: T): boolean {
    if (typeof a !== 'object' || typeof b !== 'object' || a == null || b == null) {
        return false
    }
    for(const key in a) {
        if(!(key in b) || a[key] !== b[key]) {
            return false;
        }
    }
    for(const key in b) {
        if(!(key in a) || a[key] !== b[key]) {
            return false;
        }
    }
    return true;
}