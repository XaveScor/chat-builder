/* @flow */

import * as rerenderer from 'react-test-renderer'
import { createEvent } from '../event'
import type { NotifyViewEvent } from '../types'
import { createChatMock, Mutex } from './common'
import { createPage, questionBubble, input, Stop } from '..'

it('back function', async () => {
	const firstPage = createPage()
	const secondPage = createPage()

	const start = createEvent<void>()
	const beforeBackMutex = new Mutex()
	const arterBackMutex = new Mutex()
	function rerender(count) {
		switch (count) {
			case 3:
				beforeBackMutex.release()
				break
			case 5:
				arterBackMutex.release()
				break
		}
	}
	const chatMock = createChatMock(rerender, start)

	firstPage.use({
		steps: [
			{
				question: questionBubble,
				questionProps: {
					question: '',
				},
				input,
			},
		],
		isReturnable: true,
		nextPage: secondPage,
	})

	secondPage.use({
		steps: [
			{
				question: questionBubble,
				questionProps: {
					question: '',
				},
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

	await beforeBackMutex.wait()
	const dialogBeforeBack = viewEvent.lastMessage()

	expect(dialogBeforeBack).not.toBe(null)
	if (!dialogBeforeBack) {
		throw new Error()
	}

	expect(dialogBeforeBack.dialog.size).toBe(2)
	expect(dialogBeforeBack.dialog.get(0).props.onBackToPage).not.toBe(null)
	expect(dialogBeforeBack.dialog.get(0).props.onBackToPage).toBeInstanceOf(Function)
	expect(dialogBeforeBack.dialog.get(1).props.onBackToPage).toBe(null)

	dialogBeforeBack.dialog.get(0).props.onBackToPage()

	await arterBackMutex.wait()
	const dialogAfterBack = viewEvent.lastMessage()
	if (!dialogAfterBack) {
		throw new Error()
	}
	expect(dialogAfterBack.dialog.size).toBe(1)
})

it('orderId', async () => {
	const firstPage = createPage()

	const start = createEvent<void>()
	const mutex = new Mutex()
	function rerender(count) {
		switch (count) {
			case 2:
				mutex.release()
				break
		}
	}
	const chatMock = createChatMock(rerender, start)

	firstPage.use({
		steps: [
			{
				question: questionBubble,
				questionProps: {
					question: '',
				},
				input,
			},
			{
				question: questionBubble,
				questionProps: {
					question: '',
				},
				input,
			},
		],
		isReturnable: true,
		nextPage: Stop,
	})

	const viewEvent: NotifyViewEvent = createEvent()
	chatMock(firstPage, {
		notifyView: viewEvent,
	})

	start()

	await mutex.wait()
	const dialogBeforeBack = viewEvent.lastMessage()

	expect(dialogBeforeBack).not.toBe(null)
	if (!dialogBeforeBack) {
		throw new Error()
	}
	expect(dialogBeforeBack.dialog.size).toBe(2)
	expect(dialogBeforeBack.dialog.get(0).props.stepOrderId).toBe(0)
	expect(dialogBeforeBack.dialog.get(1).props.stepOrderId).toBe(1)
})
