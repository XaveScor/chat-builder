/* @flow */
type Watcher<T> = (arg: T) => void;

export type EventType<T> = {
    (T): void,
    watch(Watcher<T>): () => void,
    waitMessage(): Promise<T>,
    lastMessage(): T | void,
};

export function createEvent<T>(): EventType<T> {
    const watchers: Array<Watcher<T>> = [];

    let lastMessage: T | void
    function Event(arg: T) {
        lastMessage = arg
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
    Event.lastMessage = () => lastMessage

    return Event;
}

export type WaitMessage<Event> = $ElementType<Event, 'waitMessage'>
