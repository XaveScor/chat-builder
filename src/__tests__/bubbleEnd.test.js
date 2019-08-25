/* @flow */
import * as React from 'react'
import { createPage, createPending, Stop, questionBubble, useChatBuilder, createInput, BubbleContainerEnd } from '..'
import { Chat } from '../ReactChat'
import * as renderer from 'react-test-renderer'
import { delay } from '../common'
import { createEvent } from '../event'
import { createChatMock, Mutex } from './common'

it('useChatBuilder', async () => {
	const input = createInput({
		component: () => <BubbleContainerEnd>pasteToBubbleEnd</BubbleContainerEnd>,
	})

	const startPage = createPage<void>(() => ({
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
	}))

	const Form = ({ chatMock }) => {
		const Chat = useChatBuilder(startPage, {
			bubbleContainer: 'div',
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
})

it('children: react component', async () => {
	const input = createInput({
		component: () => (
			<BubbleContainerEnd>
				<div>1232132</div>
			</BubbleContainerEnd>
		),
	})

	const startPage = createPage<void>(() => ({
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
	}))

	const Form = ({ chatMock }) => {
		const Chat = useChatBuilder(startPage, {
			bubbleContainer: 'div',
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
})
