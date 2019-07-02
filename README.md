## Конфигурация

### Переход на следующую страницу

Переход к следующей странице задаётся с помощью аргумента `nextPage` в конфиге. Он может принимать в себя:

0. Следующую страницу, на которую возможен переход. См. [`пример`](https://github.com/XaveScor/chat-builder/blob/master/src/__tests__/nextPage.test.js#L3)
0. Функцию, возвращающую следующую страницу. См. [`пример`](https://github.com/XaveScor/chat-builder/blob/master/src/__tests__/nextPage.test.js#L30)
0. Функцию, которая возвращает `Promise` со страницей. См. [`пример`]()

### Прокидывание данных снаружи

Для использования внешних данных в процессе работы чата нужно использовать объект Props:
```
import {createPage, runConforms, createProps, Stop} from 'chat-builder'

const value = {}
const shared = createProps(value)
const page = createPage({
    props: shared,
})

page.use((_, props) => {
    done()
    return {
        steps: [],
        nextPage: Stop,
    }
})

runConforms(page, {
    notifyView: () => {},
})
```
Для деталей смотри [`тесты`](https://github.com/XaveScor/chat-builder/blob/master/src/__tests__/props.test.js).

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

- **useChatBuilder hook**
```
import {useChatBuilder} from 'chat-builder'

const MyChat = (props) => {
    const Chat = useChatBuilder(page)

    return <Chat {...props} />
}

<MyChat a='foo' />
```
[`тесты`](https://github.com/XaveScor/chat-builder/blob/master/src/__tests__/useChatBuilder.test.js)
