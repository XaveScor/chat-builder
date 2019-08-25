import { createPage, questionBubble, answerBubble, runChat, Stop } from '..'

it('correct scenario', (done) => {
	const page = createPage()
	const timeoutPage = createPage()

	page.use({
		steps: [
			{
				question: questionBubble,
				isAnswerable: true,
				answer: answerBubble,
			},
		],
		nextPage: Stop,
		timeout: {
			duration: 50,
			page: timeoutPage,
		},
	})

	timeoutPage.use(() => {
		done()
		return {
			nextPage: Stop,
			steps: [],
		}
	})

	runChat(page, {
		notifyView: () => {},
	})
})
