// @flow
import type { PendingConfig, StopEvent, DialogElement } from './types'
import type { Step, NonAnswerableStep, AnswerableStep } from './createPage'
import { ValidationError } from './ValidationError'
import { voidF } from './common'
import type { LowLevelChatMachine } from './LowLevelChatMachine'
import type { Id as MessageId } from './IdGenerator'

type Args = {|
	config: Step,
	orderId: number,
	onBackToPage: ?(void) => mixed,
	stepId: number,
	pageId: number,
	onChange: (void) => mixed,
|}

type PendingStartedType = {
	messageId: MessageId,
	timeoutId: TimeoutID,
}

function removeEditCallback(dialogElement: ?DialogElement): ?DialogElement {
	if (!dialogElement) {
		return null
	}

	return {
		...dialogElement,
		props: {
			...dialogElement.props,
			handleEditAnswer: null,
		},
	}
}

type PageId = number
type StepId = number

const defaultTimeout = 500
export class ChatMachine {
	+lowLevelMachine: LowLevelChatMachine
	+pending: ?PendingConfig
	+stopEvent: ?StopEvent

	pendingStarted: ?PendingStartedType = null
	lastPageId = -1
	messageHistory: Array<[PageId, StepId, MessageId]> = []

	constructor(lowLevelMachine: LowLevelChatMachine, pending: ?PendingConfig, stopEvent: ?StopEvent) {
		this.lowLevelMachine = lowLevelMachine
		this.pending = pending
		this.stopEvent = stopEvent
	}

	removeEdits() {
		this.messageHistory
			.filter((el) => el[0] === this.lastPageId)
			.map((el) => el[2])
			.forEach((messageId) => this.lowLevelMachine.replace(messageId, removeEditCallback))
	}

	async editStep(
		config: AnswerableStep,
		orderId: number,
		onBackToPage: ?(void) => mixed,
		stepId: number,
		onChange: (void) => mixed,
		pageId: number,
	) {
		const savedMessages: Array<[PageId, StepId, MessageId]> = []
		await this.lowLevelMachine.transaction(() => {
			while (this.messageHistory.length) {
				const message = this.messageHistory[this.messageHistory.length - 1]
				const [, currentStepId, messageId] = message

				if (currentStepId < stepId) {
					break
				}

				savedMessages.push(this.messageHistory.pop())
				this.lowLevelMachine.stage(messageId)
			}
		})

		const answer = await this.runAnswerableStep(config, orderId, onBackToPage, stepId, onChange, pageId)

		await this.lowLevelMachine.transaction(() => {
			while (savedMessages.length) {
				const message = savedMessages.pop()
				const [pageId, currentStepId, messageId] = message

				if (currentStepId === stepId) {
					this.lowLevelMachine.removeStaged(messageId)
					continue
				}

				const newMessageId = this.lowLevelMachine.pushStaged(messageId)
				this.messageHistory.push([pageId, currentStepId, newMessageId])
			}
		})

		return answer
	}

	async removeDialog(pageId: PageId) {
		await this.lowLevelMachine.transaction(() => {
			while (this.messageHistory.length) {
				const message = this.messageHistory[this.messageHistory.length - 1]
				const [currentPageId, , messageId] = message

				if (currentPageId < pageId) {
					break
				}

				this.messageHistory.pop()
				this.lowLevelMachine.delete([messageId])
			}
		})
	}

	async stop() {
		if (this.stopEvent) {
			this.stopEvent()
		}
	}

	async showPending() {
		if (this.pendingStarted != null || this.pending == null) {
			return
		}
		const { pendingTimeout = defaultTimeout, input, inputProps, pending, pendingProps } = this.pending

		const inputConfig = {
			component: input,
			props: {
				...inputProps,
				isAnswerable: false,
			},
		}

		// show only input
		const messageId = this.lowLevelMachine.push(null, inputConfig)

		const timeoutId = setTimeout(() => {
			this.lowLevelMachine.replace(messageId, () => ({
				component: pending,
				props: pendingProps,
			}))
		}, pendingTimeout)

		this.pendingStarted = {
			messageId,
			timeoutId,
		}
	}

	async runAnswerableStep(
		config: AnswerableStep,
		orderId: number,
		onBackToPage: ?(void) => mixed,
		stepId: number,
		onChange: (void) => mixed,
		pageId: number,
	) {
		const inputProps = {
			...config.inputProps,
			isAnswerable: true,
		}
		const validate = config.validate || (voidF: (any) => void)
		return new Promise((resolve) => {
			const handleInputSubmit = (answer: any) => {
				const error = validate(answer)
				if (error instanceof ValidationError) {
					const errorMessageId = this.lowLevelMachine.push(null, {
						component: config.input,
						props: {
							...inputProps,
							error: error.message,
							onSubmit: handleInputSubmit,
						},
					})

					return this.messageHistory.push([pageId, stepId, errorMessageId])
				}

				const answerMessageId = this.lowLevelMachine.push(
					{
						component: config.answer,
						props: {
							...config.answerProps,
							answer,
							handleEditAnswer: onChange,
							onBackToPage,
							stepOrderId: orderId,
						},
					},
					{
						component: config.input,
						props: inputProps,
					},
				)
				this.messageHistory.push([pageId, stepId, answerMessageId])

				const resultF = config.resultF || ((_) => _)
				resolve(resultF(answer))
			}
			const questionMessageId = this.lowLevelMachine.push(
				{
					component: config.question,
					props: {
						...config.questionProps,
						onBackToPage,
						stepOrderId: orderId,
					},
				},
				{
					component: config.input,
					props: {
						...inputProps,
						onSubmit: handleInputSubmit,
					},
				},
			)

			this.messageHistory.push([pageId, stepId, questionMessageId])
		})
	}

	async runNonAnswerableStep(
		config: NonAnswerableStep,
		orderId: number,
		onBackToPage: ?(void) => mixed,
		stepId: number,
		pageId: number,
	) {
		const messageId = this.lowLevelMachine.push(
			{
				component: config.question,
				props: {
					...config.questionProps,
					onBackToPage,
					stepOrderId: orderId,
				},
			},
			{
				component: config.input,
				props: {
					...config.inputProps,
					isAnswerable: false,
				},
			},
		)

		this.messageHistory.push([pageId, stepId, messageId])
	}

	async runStep({ config, orderId, onBackToPage, onChange, stepId, pageId }: Args) {
		this.lastPageId = pageId
		if (this.pendingStarted) {
			const { timeoutId, messageId } = this.pendingStarted
			clearTimeout(timeoutId)
			this.lowLevelMachine.delete([messageId])
			this.pendingStarted = null
		}

		return config.isAnswerable
			? this.runAnswerableStep(config, orderId, onBackToPage, stepId, onChange, pageId)
			: this.runNonAnswerableStep(config, orderId, onBackToPage, stepId, pageId)
	}
}
