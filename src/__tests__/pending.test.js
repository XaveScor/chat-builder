/* @flow */
import * as React from 'react';
import {createPage, createPending, input, Stop, questionBubble, useChatBuilder} from '..'
import {Chat} from '../ReactChat'
import * as renderer from 'react-test-renderer'
import {delay} from '../common'
import {createEvent} from '../event'
import {createChatMock, Mutex} from './common'

const pending = createPending({
    component: () => 'pending',
})
const pendingConfig = {
    pending,
    pendingTimeout: 1, 
    input,
}

it('ConformsForm', async () => {
    const startPage = createPage(async () => {
        await delay(100)
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
    const mutex = new Mutex()
    function rerender(count) {
        mutex.release()
    }
    const chatMock = createChatMock(rerender, start)
    const tree = renderer
        .create(<Chat runChat={chatMock} page={startPage} pending={pendingConfig} />)

    renderer.act(() => {
        start()
    })

    await mutex.wait()
    
    const res1 = tree.toJSON()
    expect(res1).toMatchSnapshot()

    await mutex.wait()

    const res2 = tree.toJSON()
    expect(res2).toMatchSnapshot()
});

it('useChatBuilder', async () => {
    const startPage = createPage<void>(async () => {
        await delay(1000)
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

    const Form = ({chatMock}) => {
        const Chat = useChatBuilder(startPage, {
            pending: pendingConfig,
        })

        return <Chat runChat={chatMock} />
    }

    const start = createEvent<void>()
    const mutex = new Mutex()
    function rerender(count) {
        mutex.release()
    }
    const chatMock = createChatMock(rerender, start)

    const tree = renderer.create(<Form chatMock={chatMock} />)
    renderer.act(() => {
        start()
    })
    await mutex.wait()
    
    const res1 = tree.toJSON()
    expect(res1).toMatchSnapshot()

    await mutex.wait()

    const res2 = tree.toJSON()
    expect(res2).toMatchSnapshot()
});
