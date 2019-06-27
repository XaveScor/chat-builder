## Конфигурация

```
type TotalPage = Page | PageType

export type StepResult = {
    id: any,
    value: any,
}

export type PrevousPageResult = {
    prevousPage: TotalPage,
    steps: $ReadOnlyArray<StepResult>,
};

export type SingleStep<T> = {|
    ...$Exact<SinglePhrase<T>>,
    question: T,
    id: any,
    input: Input,
|};

export type TripleStep<Tq, Ta, Te> = {|
    ...$Exact<TriplePhrase<Tq, Ta, Te>>,
    question: Tq,
    error: Te,
    id: any,
    input: Input,
|};

export type Step =
    | SingleStep<*>
    | TripleStep<*, *, *>

export type TimeoutConfig = {|
    duration: number,
    page: TotalPage,
|}

export type MapPrevousPage<T: NonFunction> = 
    | (PrevousPageResult => Promise<T>)
    | (PrevousPageResult => T)
    | T

type NextPage = MapPrevousPage<TotalPage>

export type Config = {|
    nextPage: NextPage, // См. "переход на следующую страницу"
    steps: $ReadOnlyArray<Step>,
    timeout?: TimeoutConfig,
|};

export type SchemeF = MapPrevousPage<Config>
```

### Переход на следующую страницу

Переход к следующей странице задаётся с помощью аргумента `nextPage` в конфиге. Он может принимать в себя:

0. Следующую страницу, на которую возможен переход. См. [`пример`](https://github.com/XaveScor/chat-builder/blob/master/src/__tests__/nextPage.test.js#L3)
0. Функцию, возвращающую следующую страницу. См. [`пример`](https://github.com/XaveScor/chat-builder/blob/master/src/__tests__/nextPage.test.js#L30)
0. Функцию, которая возвращает `Promise` со страницей. См. [`пример`]()

## Компоненты

- **Input**

```
import {createInput} from 'chat-builder'

const Input = ({
    value, // текущее значение поля
    setValue, // изменить текущее значение поля
    submit, // отправить ответ
}) => {}
const myInput = createInput({
    component: Input,
})
```
В качестве примера смотрите [`input.js`](https://github.com/XaveScor/chat-builder/blob/master/src/controls/input.js) который идёт в составе библиотеки.
