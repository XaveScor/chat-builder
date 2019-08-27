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

const defaultTimeout = 500
export class ChatMachine {
	+lowLevelMachine: LowLevelChatMachine
	+pending: ?PendingConfig
	+stopEvent: ?StopEvent

	pendingStarted: ?PendingStartedType = null
	mapStepToMessage = new Map<number, Set<MessageId>>()
	mapPageToStep = new Map<number, Set<number>>()
	lastPageId = -1
	savedMessages = new Set<MessageId>()

	constructor(lowLevelMachine: LowLevelChatMachine, pending: ?PendingConfig, stopEvent: ?StopEvent) {
		this.lowLevelMachine = lowLevelMachine
		this.pending = pending
		this.stopEvent = stopEvent
	}

	removeEdits() {
		const steps = this.mapPageToStep.get(this.lastPageId)
		if (!steps) {
			return
		}
		const messages = Array.from(steps)
			.map((stepId) => this.mapStepToMessage.get(stepId))
			.filter(Boolean)
			.flatMap((set) => Array.from(set))
		for (const id of messages) {
			this.lowLevelMachine.replace(id, removeEditCallback)
		}
	}

	async editStep(
		stepId: number,
		config: AnswerableStep,
		orderId: number,
		onBackToPage: ?(void) => mixed,
		pageId: number,
	) {
		this.lowLevelMachine.startTransaction()
		for (const [currentStepId, messages] of this.mapStepToMessage) {
			if (currentStepId < stepId) {
				continue
			}
			for (const messageId of messages) {
				this.savedMessages.add(messageId)
				this.lowLevelMachine.stage(messageId)
			}
		}
		this.lowLevelMachine.stopTransaction()

		const answer = await this.runAnswerableStep(config, orderId, onBackToPage, stepId, () => {}, pageId)

		const messages = this.mapStepToMessage.get(stepId)
		if (!messages) {
			throw new Error('you cannot edit stepId = ' + stepId)
		}
		for (const messageId of messages) {
			this.lowLevelMachine.removeStaged(messageId)
		}

		this.lowLevelMachine.startTransaction()
		for (const savedMessageId of this.savedMessages) {
			this.lowLevelMachine.pushStaged(savedMessageId)
		}
		this.lowLevelMachine.stopTransaction()

		return answer
	}

	async removeDialog(id: number) {
		const deletedPageIds: Array<number> = []
		const deletedStepIds: Array<number> = []
		const deletedMessageIds: Array<MessageId> = []
		for (const [pageId, stepsSet] of this.mapPageToStep) {
			if (pageId < id) {
				continue
			}

			const stepIds = Array.from(stepsSet)
				.map((stepId) => this.mapStepToMessage.get(stepId))
				.filter(Boolean)
				.flatMap((messages) => Array.from(messages))

			deletedStepIds.push(...stepsSet)
			deletedMessageIds.push(...stepIds)
			deletedPageIds.push(pageId)
		}

		this.lowLevelMachine.delete(deletedMessageIds)
		for (const pageId of deletedPageIds) {
			this.mapPageToStep.delete(pageId)
		}
		for (const stepId of deletedStepIds) {
			this.mapStepToMessage.delete(stepId)
		}
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
					return this.saveMessageId(errorMessageId, stepId, pageId)
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
				this.saveMessageId(answerMessageId, stepId, pageId)

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

			this.saveMessageId(questionMessageId, stepId, pageId)
		})
	}

	saveMessageId(messageId: MessageId, stepId: number, pageId: number) {
		let messagesSet = this.mapStepToMessage.get(stepId)
		if (!messagesSet) {
			messagesSet = new Set<MessageId>()
			this.mapStepToMessage.set(stepId, messagesSet)
		}
		messagesSet.add(messageId)

		let stepsSet = this.mapPageToStep.get(pageId)
		if (!stepsSet) {
			stepsSet = new Set<number>()
			this.mapPageToStep.set(pageId, stepsSet)
		}
		stepsSet.add(stepId)
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

		this.saveMessageId(messageId, stepId, pageId)
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
