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
