/* @flow */
import { ChatMachine } from './ChatMachine'
import type { SendMessageToExecutorEvent, SendMessageToMasterEvent } from './types'
import type { StepResult } from './createPage'
import { createEvent, type WaitMessage } from './event'
import { runWithTimeout, TimeoutError } from './runWithTimeout'

export class ExecutorActor {
	+sendMessageToMasterEvent: SendMessageToMasterEvent
	+getMasterMessageAsync: WaitMessage<SendMessageToExecutorEvent>
	+chatMachine: ChatMachine

	constructor(
		sendMessageToMasterEvent: SendMessageToMasterEvent,
		getMasterMessageAsync: WaitMessage<SendMessageToExecutorEvent>,
		chatMachine: ChatMachine,
	) {
		this.sendMessageToMasterEvent = sendMessageToMasterEvent
		this.getMasterMessageAsync = getMasterMessageAsync
		this.chatMachine = chatMachine
	}

	async run() {
		const breakEvent = createEvent<void>()
		let stepId = 0
		while (true) {
			const message = await this.getMasterMessageAsync()
			switch (message.type) {
				case 'showSteps':
					const { steps, timeoutDuration, isReturnable, pageId } = message
					const onBackToPage = isReturnable
						? () => {
								breakEvent()
								this.sendMessageToMasterEvent({
									type: 'back',
									pageId,
								})
						  }
						: null

					try {
						const res = await runWithTimeout(
							async () => {
								const results: Array<StepResult> = []

								for (let i = 0; i < steps.length; ++i) {
									const step = steps[i]

									const currentStepId = ++stepId
									const onChange = async () => {
										const result = await this.chatMachine.editStep(
											step,
											i,
											onBackToPage,
											currentStepId,
											onChange,
											pageId,
										)
										results[i].value = result
									}
									const stepResult = await this.chatMachine.runStep({
										config: step,
										orderId: i,
										onBackToPage,
										onChange,
										pageId,
										stepId: currentStepId,
									})
									results.push({
										id: step.id,
										value: stepResult,
									})
								}

								this.chatMachine.removeEdits()

								return results
							},
							timeoutDuration,
							breakEvent,
						)

						this.sendMessageToMasterEvent({
							type: 'steps',
							results: res,
						})
					} catch (e) {
						if (e instanceof TimeoutError) {
							this.sendMessageToMasterEvent({
								type: 'timeout',
							})
						}
					}
					continue
			}
		}
	}
}
