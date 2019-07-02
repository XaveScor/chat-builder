/* @flow */

export type Props<T: {}> = {|
    getData(): T;
    replace(T): void;
|}

declare export function createProps(): Props<{}>
declare export function createProps<T: {}>(initData: T): Props<T>
export function createProps<T: {}>(initData?: T): Props<T | {}> {
    let data = initData || {}
    return {
        getData: () => data,
        replace: (_data: T | {}) => {
            data = _data
        },
    }
}
