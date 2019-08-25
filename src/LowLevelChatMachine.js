/* @flow */
import { OrderedMap } from 'immutable'
import type { DialogElement, State, NotifyViewEvent } from './types'
import { IdGenerator, type Id as MessageId } from './IdGenerator'

export type DialogInput = $PropertyType<State, 'input'>

export class LowLevelChatMachine {
	notifyView: NotifyViewEvent
	dialog: OrderedMap<MessageId, DialogElement> = OrderedMap()
	inputs: OrderedMap<MessageId, DialogInput> = OrderedMap()
	idGenerator = new IdGenerator()

	constructor(notifyView: NotifyViewEvent) {
		this.notifyView = notifyView
	}

	reloadView() {
		this.notifyView({
			dialog: this.dialog,
			input: this.inputs.last(),
		})
	}

	push(dialogElement?: ?DialogElement, input?: DialogInput): MessageId {
		const id = this.idGenerator.next()
		if (dialogElement) {
			this.dialog = this.dialog.set(id, dialogElement)
		}
		if (input) {
			this.inputs = this.inputs.set(id, input)
		}

		this.reloadView()

		return id
	}

	delete(ids: $ReadOnlyArray<MessageId>) {
		this.dialog = OrderedMap(this.dialog.deleteAll(ids))
		this.inputs = OrderedMap(this.inputs.deleteAll(ids))
		this.reloadView()
	}
}
