/* @flow */

export type Props<T> = {|
    getData(): $NonMaybeType<T>;
    replace(T): void;
    isEmpty(): boolean;
|}

export function createProps<T>(initData?: T): Props<T> {
    let data: ?T = initData
    return {
        isEmpty: () => data == null,
        getData: () => {
            if (data == null) {
                throw new Error('you cannot use props before init')
            }
            return data
        },
        replace: (_data: T) => {
            data = _data
        },
    }
}
