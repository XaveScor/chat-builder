/* @flow */
import { OrderedMap } from 'immutable'
import type { DialogElement, State, NotifyViewEvent } from './types'
import { IdGenerator, type Id as MessageId } from './IdGenerator'

export type DialogInput = $PropertyType<State, 'input'>

export class LowLevelChatMachine {
	notifyView: NotifyViewEvent
	dialog: OrderedMap<MessageId, ?DialogElement> = OrderedMap()
	inputs: OrderedMap<MessageId, ?DialogInput> = OrderedMap()
	idGenerator = new IdGenerator()
	stagedMessages = new Map<MessageId, DialogElement>()
	transactionStarted = false

	constructor(notifyView: NotifyViewEvent) {
		this.notifyView = notifyView
	}

	startTransaction() {
		this.transactionStarted = true
	}

	stopTransaction() {
		this.transactionStarted = false
		this.reloadView()
	}

	reloadView() {
		if (this.transactionStarted) {
			return
		}

		if (!this.dialog.size) {
			return this.notifyView({
				dialog: this.dialog,
				input: null,
			})
		}

		const lastMessageId = this.dialog.entrySeq().last()[0]

		this.notifyView({
			dialog: this.dialog,
			input: this.inputs.get(lastMessageId),
		})
	}

	push(dialogElement?: ?DialogElement, input?: DialogInput): MessageId {
		const id = this.idGenerator.next()

		this.replace(id, () => dialogElement, () => input)

		return id
	}

	delete(ids: $ReadOnlyArray<MessageId>) {
		this.dialog = OrderedMap(this.dialog.deleteAll(ids))
		this.inputs = OrderedMap(this.inputs.deleteAll(ids))
		this.reloadView()
	}

	stage(messageId: MessageId) {
		const element = this.dialog.get(messageId)
		if (!element) {
			return
		}
		this.stagedMessages.set(messageId, element)
		this.dialog = this.dialog.remove(messageId)
		this.reloadView()
	}

	pushStaged(messageId: MessageId): MessageId {
		const element = this.stagedMessages.get(messageId)
		if (!element) {
			throw new Error(`messageId = ${messageId} not found in staged area`)
		}
		this.stagedMessages.delete(messageId)
		const input = this.inputs.get(messageId)
		if (!input) {
			throw new Error(`messageId = ${messageId} not found in input area`)
		}
		this.inputs.delete(messageId)

		return this.push(element, input)
	}

	removeStaged(messageId: MessageId) {
		this.stagedMessages.delete(messageId)
	}

	replace(
		id: MessageId,
		setDialogElement?: (?DialogElement) => ?DialogElement,
		setInput?: (?DialogInput) => ?DialogInput,
	) {
		if (setDialogElement) {
			const dialogElement = setDialogElement(this.dialog.get(id))
			this.dialog = this.dialog.set(id, dialogElement)
		} else {
			const currentValue = this.dialog.get(id)
			if (!currentValue) {
				this.dialog = this.dialog.set(id, null)
			}
		}
		if (setInput) {
			const input = setInput(this.inputs.get(id))
			this.inputs = this.inputs.set(id, input)
		} else {
			const currentValue = this.inputs.get(id)
			if (!currentValue) {
				this.inputs = this.inputs.set(id, null)
			}
		}

		this.reloadView()
	}
}
