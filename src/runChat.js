// @flow
import type {NotifyViewEvent, StopEvent, PendingConfig, SendMessageToExecutorEvent, SendMessageToMasterEvent} from './types'
import {Page} from './createPage'
import {createEvent} from './event'
import {ExecutorActor} from './ExecutorActor'
import {MasterActor} from './MasterActor'
import {ChatMachine} from './ChatMachine'

export async function runChat<TProps>(
    initPage: Page<TProps>,
    setup: {
        notifyView: NotifyViewEvent,
        stopEvent?: StopEvent,
        pending?: PendingConfig,
    },
) {
    const sendMessageToExecutorEvent: SendMessageToExecutorEvent = createEvent()
    const sendMessageToMasterEvent: SendMessageToMasterEvent = createEvent()

    const machine = new ChatMachine(setup.notifyView, setup.pending, setup.stopEvent)
    const masterActor = new MasterActor<TProps>(
        sendMessageToExecutorEvent,
        sendMessageToMasterEvent.waitMessage,
        initPage,
        machine,
    )
    const executorActor = new ExecutorActor(
        sendMessageToMasterEvent,
        sendMessageToExecutorEvent.waitMessage,
        machine,
    )

    executorActor.run()
    masterActor.run()
}
export type RunChat = typeof runChat
