/* @flow */
import { createPage, questionBubble, input, Stop, answerBubble, runChat } from '..'

it('right path', (done) => {
	const startPage = createPage()
	const finalPage = createPage()

	startPage.use({
		steps: [
			{
				question: questionBubble,
				questionProps: {
					question: '123',
				},
				isAnswerable: true,
				resultF: (el) => el.x,
				answer: answerBubble,
				answerProps: {
					stringify: (el) => el.x,
				},
				input,
			},
		],
		nextPage: finalPage,
	})

	finalPage.use((res) => {
		expect(res.steps[0].value).toBe(1)
		done()
		return {
			steps: [],
			nextPage: Stop,
		}
	})

	runChat(startPage, {
		notifyView: (data) => {
			const onSubmit: (any) => {} = data?.input?.props?.onSubmit || (() => {})
			onSubmit({ x: 1 })
		},
	})
})
