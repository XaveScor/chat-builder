/* @flow */
import * as renderer from 'react-test-renderer'
import { runChat } from '../runChat'
import { Page } from '../createPage'
import type { NotifyViewEvent, StopEvent, PendingConfig } from '../types'
import { type EventType, createEvent } from '../event'

export function createChatMock(notifyRender: (number) => void, start: EventType<void>) {
	return <TProps>(
		initPage: Page<TProps>,
		setup: {
			notifyView: NotifyViewEvent,
			stopEvent?: StopEvent,
			pending?: PendingConfig,
		},
	) => {
		let notifies = 0
		function notifyView(...args) {
			renderer.act(() => {
				setup.notifyView(...args)
			})
			notifyRender(++notifies)
		}

		const stopEvent = createEvent<void>()
		stopEvent.watch(() => {
			renderer.act(() => {
				if (typeof setup.stopEvent === 'function') {
					setup.stopEvent()
				}
			})
		})

		const unsubscribe = start.watch(() => {
			runChat(initPage, {
				...setup,
				notifyView,
				stopEvent,
			})
			unsubscribe()
		})

		return Promise.resolve()
	}
}

export class Mutex {
	pipeline = Promise.resolve()
	resolve: (void) => void = () => {}

	release() {
		this.resolve()
	}

	async wait() {
		await this.pipeline.then(() => new Promise((r) => (this.resolve = r)))
	}
}
