/* @flow */
import {createChatMock, Mutex} from './common'
import {createEvent} from '../event'
import {createPage, questionBubble, input, Stop, answerBubble, ValidationError} from '..'
import type {NotifyViewEvent} from '../types'

it('onSumbit function cannot sended after invalid validation', async () => {
    const firstPage = createPage()

    const start = createEvent<void>()
    const mutex = new Mutex()
    function rerender(count) {
        mutex.release()
    }
    const chatMock = createChatMock(rerender, start)

    firstPage.use({
        steps: [
            {
                question: questionBubble,
                questionProps: {
                    question: '',
                },
                isAnswerable: true,
                answer: answerBubble,
                validate: () => new ValidationError(),
                input,
            },
        ],
        nextPage: Stop,
    })

    const viewEvent: NotifyViewEvent = createEvent()
    chatMock(
        firstPage,
        {
            notifyView: viewEvent,
        },
    )

    start()


    await mutex.wait()
    const validMessage = viewEvent.lastMessage()
    
    expect(validMessage).toBeDefined()
    /*:: if (!validMessage) {throw new Error()} */
    expect(validMessage.dialog.length).toBe(1)
    expect(validMessage.input.props.onSubmit).toBeDefined()
    
    validMessage.input.props.onSubmit('123')

    const invalidMessage = viewEvent.lastMessage()
    expect(invalidMessage).toBeDefined()
    /*:: if (!invalidMessage) {throw new Error()} */
    expect(invalidMessage.dialog.length).toBe(1)
    expect(invalidMessage.input.props.onSubmit).toBeDefined()
})
