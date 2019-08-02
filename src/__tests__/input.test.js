/* @flow */
import * as React from 'react';
import {createPage, questionBubble, input, Stop, answerBubble, createInput} from '..'
import {createChatMock} from './common'
import {Chat} from '../ReactChat'
import {delay} from '../common'
import {createEvent} from '../event'
import * as renderer from 'react-test-renderer'

it('renders correctly', async () => {
    const startPage = createPage()

    startPage.use({
        steps: [
            {
                question: questionBubble,
                questionProps: {
                    question: '',
                },
                input,
            }
        ],
        nextPage: Stop,
    })

    const start = createEvent<void>()
    function rerender(count) {}
    const chatMock = createChatMock(rerender, start)
    const tree = renderer.create(<Chat runChat={chatMock} page={startPage} />)

    renderer.act(() => {
        start()
    })

    await delay(1000)

    const res = tree.toJSON()
    expect(res).toMatchSnapshot()
});

it('input with props', async () => {
    const startPage = createPage()

    const CustomInput = createInput<{a: number}>({
        component: ({a}) => `custom Input with a, value: ${a}`,
    })

    startPage.use({
        steps: [
            {
                question: questionBubble,
                questionProps: {
                    question: '123',
                },
                isAnswerable: true,
                input: CustomInput,
                inputProps: {
                    a: 1,
                },
            }
        ],
        nextPage: Stop,
    })

    const start = createEvent<void>()
    function rerender(count) {}
    const chatMock = createChatMock(rerender, start)
    const tree = renderer.create(<Chat runChat={chatMock} page={startPage} />)

    renderer.act(() => {
        start()
    })

    await delay(1000)

    const res = tree.toJSON()
    expect(res).toMatchSnapshot()
});
