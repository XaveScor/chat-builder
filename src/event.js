/* @flow */
type Watcher<T> = (arg: T) => void;

export type EventType<T> = {
    (T): void,
    watch(Watcher<T>): () => void,
};

export function createEvent<T>(): EventType<T> {
    const watchers: Array<Watcher<T>> = [];

    function Event(arg: T) {
        watchers.forEach(f => f(arg))
    }
    Event.watch = (subscriber: Watcher<T>) => {
        watchers.push(subscriber);
        const id = watchers.length - 1;
        return () => {
            delete watchers[id];
        }
    };

    return Event;
}
