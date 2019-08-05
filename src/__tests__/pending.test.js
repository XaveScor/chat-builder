/* @flow */
import * as React from 'react';
import {createPage, createPending, input, Stop, questionBubble, useChatBuilder, runChat} from '..'
import {Chat} from '../ReactChat'
import * as renderer from 'react-test-renderer'
import {delay} from '../common'
import {createEvent} from '../event'
import {createChatMock} from './common'

const pending = createPending({
    component: () => 'pending',
})
const pendingConfig = {
    pending,
    input,
}

it('ConformsForm', async () => {
    const startPage = createPage(async () => {
        await delay(700)
        return {
            steps: [
                {
                    question: questionBubble,
                    questionProps: {
                        question: 'question',
                    },
                    input,
                },
            ],
            nextPage: Stop,
        }
    })

    const start = createEvent<void>()
    function rerender(count) {}
    const chatMock = createChatMock(rerender, start)
    const tree = renderer
        .create(<Chat runChat={chatMock} page={startPage} pending={pendingConfig} />)

    renderer.act(() => {
        start()
    })
    await delay(600)
    
    const res1 = tree.toJSON()
    expect(res1).toMatchSnapshot()

    await delay(700)

    const res2 = tree.toJSON()
    expect(res2).toMatchSnapshot()
});

it('useChatBuilder', async () => {
    const startPage = createPage<void>(async () => {
        await delay(700)
        return {
            steps: [
                {
                    question: questionBubble,
                    questionProps: {
                        question: 'question',
                    },
                    input,
                },
            ],
            nextPage: Stop,
        }
    })

    const Form = () => {
        const Chat = useChatBuilder(startPage, {
            pending: pendingConfig,
        })

        return <Chat runChat={runChat} />
    }

    const start = createEvent<void>()
    function rerender(count) {}
    const chatMock = createChatMock(rerender, start)
    
    const tree = renderer.create(<Form />)
    renderer.act(() => {
        start
    })

    await delay(600)
    
    const res1 = tree.toJSON()
    expect(res1).toMatchSnapshot()

    await delay(700)

    const res2 = tree.toJSON()
    expect(res2).toMatchSnapshot()
});
