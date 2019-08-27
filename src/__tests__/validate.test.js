/* @flow */

import { createEvent } from '../event'
import type { NotifyViewEvent } from '../types'
import { Mutex, createChatMock } from './common'
import { createPage, questionBubble, input, Stop, answerBubble, ValidationError } from '..'

it('onSumbit function cannot sended after invalid validation', async () => {
	const firstPage = createPage()

	const start = createEvent<void>()
	const mutex = new Mutex()
	function rerender() {
		mutex.release()
	}
	const chatMock = createChatMock(rerender, start)
	const errorText = 'errorText'
	firstPage.use({
		steps: [
			{
				question: questionBubble,
				questionProps: {
					question: '',
				},
				isAnswerable: true,
				answer: answerBubble,
				validate: () => new ValidationError(errorText),
				input,
			},
		],
		nextPage: Stop,
	})

	const viewEvent: NotifyViewEvent = createEvent()
	chatMock(firstPage, {
		notifyView: viewEvent,
	})

	start()

	await mutex.wait()
	const validMessage = viewEvent.lastMessage()

	expect(validMessage).toBeDefined()
	if (!validMessage) {
		throw new Error()
	}
	expect(validMessage.dialog.size).toBe(1)
	expect(validMessage.input.props.onSubmit).toBeDefined()

	validMessage.input.props.onSubmit('123')

	const invalidMessage = viewEvent.lastMessage()
	expect(invalidMessage).toBeDefined()
	if (!invalidMessage) {
		throw new Error()
	}
	expect(invalidMessage.dialog.size).toBe(2)
	expect(invalidMessage.input.props.error).toBe(errorText)
	expect(invalidMessage.input.props.onSubmit).toBeDefined()
})
