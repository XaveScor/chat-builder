/* @flow */
import * as React from 'react'
import * as renderer from 'react-test-renderer'
import { createEvent } from '../event'
import { createChatMock, Mutex } from './common'
import { createPage, input, Stop, questionBubble, useChatBuilder } from '..'

it('useChatBuilder', async () => {
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
	function rerender() {
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
