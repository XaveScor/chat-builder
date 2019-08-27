/* @flow */

import { createEvent } from '../event'
import type { NotifyViewEvent } from '../types'
import { Mutex, createChatMock } from './common'
import { createPage, questionBubble, input, Stop, answerBubble } from '..'

it('edit text', async () => {
	const firstPage = createPage()

	const start = createEvent<void>()
	const mutex = new Mutex()
	function rerender() {
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
				input,
			},
			{
				question: questionBubble,
				questionProps: {
					question: '',
				},
				isAnswerable: true,
				answer: answerBubble,
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
	const firstDialog = viewEvent.lastMessage()

	expect(firstDialog).toBeDefined()
	if (!firstDialog) {
		throw new Error()
	}
	expect(firstDialog.dialog.size).toBe(1)
	expect(firstDialog.input.props.onSubmit).toBeDefined()

	const firstAnswer = '123'
	firstDialog.input.props.onSubmit(firstAnswer)

	const secondDialog = viewEvent.lastMessage()
	expect(secondDialog).toBeDefined()
	if (!secondDialog) {
		throw new Error()
	}
	expect(secondDialog.dialog.size).toBe(2)
	expect(secondDialog.dialog.get(1).props.answer).toBe(firstAnswer)
	expect(secondDialog.dialog.get(1).props.handleEditAnswer).toBeDefined()

	secondDialog.dialog.get(1).props.handleEditAnswer()

	const thirdDialog = viewEvent.lastMessage()
	expect(thirdDialog).toBeDefined()
	if (!thirdDialog) {
		throw new Error()
	}
	expect(thirdDialog.dialog.size).toBe(1)
	expect(thirdDialog.input.props.onSubmit).toBeDefined()

	const thirdAnswer = '456'
	thirdDialog.input.props.onSubmit(thirdAnswer)

	const fourthDialog = viewEvent.lastMessage()
	expect(fourthDialog).toBeDefined()
	if (!fourthDialog) {
		throw new Error()
	}
	expect(fourthDialog.dialog.size).toBe(2)
	expect(fourthDialog.dialog.get(3).props.answer).toBe(thirdAnswer)
})
