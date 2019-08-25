/* @flow */
import * as React from 'react'
import { createPage, createPending, input, Stop, questionBubble, useChatBuilder, createInput } from '..'
import { Chat } from '../ReactChat'
import * as renderer from 'react-test-renderer'
import { delay } from '../common'
import { createEvent } from '../event'
import { createChatMock, Mutex } from './common'

const pending = createPending({
	component: () => 'pending',
})

const pendingInput = createInput({
	component: () => 'pending input',
})

const pendingConfig = {
	pending,
	pendingTimeout: 50,
	input: pendingInput,
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
	const tree = renderer.create(<Chat runChat={chatMock} page={startPage} pending={pendingConfig} />)

	renderer.act(() => {
		start()
	})

	const resOnlyInputChange = tree.toJSON()
	expect(resOnlyInputChange).toMatchSnapshot()

	await mutex.wait()

	const resShowPending = tree.toJSON()
	expect(resShowPending).toMatchSnapshot()

	await mutex.wait()

	const resHidePending = tree.toJSON()
	expect(resHidePending).toMatchSnapshot()
})

it('useChatBuilder', async () => {
	const startPage = createPage<void>(async () => {
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

	const Form = ({ chatMock }) => {
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

	const resOnlyInputChange = tree.toJSON()
	expect(resOnlyInputChange).toMatchSnapshot()

	await mutex.wait()

	const resShowPending = tree.toJSON()
	expect(resShowPending).toMatchSnapshot()

	await mutex.wait()

	const resHidePending = tree.toJSON()
	expect(resHidePending).toMatchSnapshot()
})
