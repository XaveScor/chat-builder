/* @flow */
import { createPage, questionBubble, input, runChat, Stop } from '..'

it('correct constant scenario', (done) => {
	const startPage = createPage()
	const finalPage = createPage()

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
		nextPage: finalPage,
	})

	finalPage.use(() => {
		done()
		return {
			nextPage: Stop,
			steps: [],
		}
	})

	runChat(startPage, {
		notifyView: () => {},
	})
})

it('correct function scenario', (done) => {
	const startPage = createPage()
	const finalPage = createPage()

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
		nextPage: () => finalPage,
	})

	finalPage.use(() => {
		done()
		return {
			nextPage: Stop,
			steps: [],
		}
	})

	runChat(startPage, {
		notifyView: () => {},
	})
})
