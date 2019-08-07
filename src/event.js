/* @flow */
type Watcher<T> = (arg: T) => void;

export type EventType<T> = {
    (T): void,
    watch(Watcher<T>): () => void,
    waitMessage(): Promise<T>,
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
    Event.waitMessage = async () => {
        return new Promise(resolve => {
            const unsubscribe = Event.watch(data => {
                resolve(data)
                unsubscribe()
            })
        })
    }

    return Event;
}

export type WaitMessage<Event> = $ElementType<Event, 'waitMessage'>
