/* @flow */
import * as React from 'react'
import * as renderer from 'react-test-renderer'
import { createEvent } from '../event'
import { createChatMock, Mutex } from './common'
import { Chat, createPage, questionBubble, input, Stop, answerBubble, createInput } from '..'

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
			},
		],
		nextPage: Stop,
	})

	const start = createEvent<void>()
	const mutex = new Mutex()
	function rerender() {
		mutex.release()
	}
	const chatMock = createChatMock(rerender, start)
	const tree = renderer.create(<Chat runChat={chatMock} page={startPage} />)

	renderer.act(() => {
		start()
	})

	await mutex.wait()

	const res = tree.toJSON()
	expect(res).toMatchSnapshot()
})

it('input with props', async () => {
	const startPage = createPage()

	const CustomInput = createInput<{ a: number }>({
		component: ({ a }) => `custom Input with a, value: ${a}`,
	})

	startPage.use({
		steps: [
			{
				question: questionBubble,
				questionProps: {
					question: '123',
				},
				isAnswerable: true,
				answer: answerBubble,
				input: CustomInput,
				inputProps: {
					a: 1,
				},
			},
		],
		nextPage: Stop,
	})

	const start = createEvent<void>()
	const mutex = new Mutex()
	function rerender() {
		mutex.release()
	}
	const chatMock = createChatMock(rerender, start)
	const tree = renderer.create(<Chat runChat={chatMock} page={startPage} />)

	renderer.act(() => {
		start()
	})

	await mutex.wait()

	const res = tree.toJSON()
	expect(res).toMatchSnapshot()
})
