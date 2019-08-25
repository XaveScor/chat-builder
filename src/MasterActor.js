/* @flow */
import * as pageTypes from './pageTypes'
import { ChatMachine } from './ChatMachine'
import type { SendMessageToExecutorEvent, SendMessageToMasterEvent } from './types'
import { type PrevousPageResult, type MapPrevousPage, type NonFunction, type Config, Page } from './createPage'
import { type WaitMessage } from './event'

async function callPrevousPageF<TProps, T: NonFunction>(
	map: MapPrevousPage<TProps, T>,
	result: PrevousPageResult<TProps>,
	getProps: (void) => TProps,
): Promise<T> {
	if (typeof map === 'function') {
		return Promise.resolve(map(result, getProps))
	}

	return map
}

export class MasterActor<TProps> {
	+sendMessageToExecutorEvent: SendMessageToExecutorEvent
	+getExecutorMessageAsync: WaitMessage<SendMessageToMasterEvent>
	+initPage: Page<TProps>
	+chatMachine: ChatMachine

	constructor(
		sendMessageToExecutorEvent: SendMessageToExecutorEvent,
		getExecutorMessageAsync: WaitMessage<SendMessageToMasterEvent>,
		initPage: Page<TProps>,
		chatMachine: ChatMachine,
	) {
		this.sendMessageToExecutorEvent = sendMessageToExecutorEvent
		this.getExecutorMessageAsync = getExecutorMessageAsync
		this.initPage = initPage
		this.chatMachine = chatMachine
	}

	async run() {
		let result: PrevousPageResult<TProps> = {
			prevousPage: pageTypes.Start,
			steps: [],
		}
		const pageResultsHistory: Array<Config<TProps>> = []

		let currentPage = this.initPage
		let currentPageResult: Config<TProps>
		let returnPageResult: ?Config<TProps> = null
		while (true) {
			if (currentPage === pageTypes.Stop) {
				this.chatMachine.stop()
				return
			}

			const { props } = currentPage
			if (!returnPageResult) {
				if (!currentPage.schemeF) {
					throw new Error(`You should declare schemeF in ${currentPage.name || 'createPage'}.use method`)
				}
				const { schemeF } = currentPage

				this.chatMachine.showPending()
				// TODO: fix flow type inference
				currentPageResult = await callPrevousPageF(schemeF, result, props.getData)
				if (currentPageResult.nextPage === pageTypes.Repeat) {
					if (pageResultsHistory.length === 0) {
						throw new Error(`You cannot use Repeat at init page`)
					}
					currentPageResult = pageResultsHistory[pageResultsHistory.length - 1]
				}
			} else {
				currentPageResult = returnPageResult
				returnPageResult = null
			}

			pageResultsHistory.push(currentPageResult)
			const { nextPage, steps, timeout, isReturnable } = currentPageResult
			const duration = timeout != null ? timeout.duration : -1

			this.sendMessageToExecutorEvent({
				type: 'showSteps',
				steps,
				timeoutDuration: duration,
				isReturnable: Boolean(isReturnable),
				pageId: pageResultsHistory.length - 1,
			})
			const executorMessage = await this.getExecutorMessageAsync()
			switch (executorMessage.type) {
				case 'steps':
					result = {
						prevousPage: currentPage,
						steps: executorMessage.results,
					}
					currentPage = await callPrevousPageF(nextPage, result, props.getData)
					break
				case 'timeout':
					result = {
						prevousPage: currentPage,
						steps: [],
					}
					if (timeout) {
						currentPage = timeout.page
					} else {
						currentPage = await callPrevousPageF(nextPage, result, props.getData)
					}
					break
				case 'back':
					const { pageId } = executorMessage
					returnPageResult = pageResultsHistory[pageId]
					pageResultsHistory.length = pageId
					this.chatMachine.removeDialog(pageId)
					break
			}
		}
	}
}
