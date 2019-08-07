/* @flow */
import * as pageTypes from './pageTypes';
import {ChatMachine} from './ChatMachine';
import type {SendMessageToExecutorEvent, SendMessageToMasterEvent} from './types';
import type { StepResult} from './createPage';
import {createEvent, type WaitMessage} from './event';
import {runWithTimeout, TimeoutError} from './runWithTimeout'

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
        while (true) {
            const message = await this.getMasterMessageAsync()
            switch (message.type) {
                case 'showSteps':
                    const {steps, timeoutDuration} = message

                    const returnToPartEvent = createEvent<void>()
                    const returnController = new AbortController()

                    try {
                    const res = await runWithTimeout(async abortController => {
                        const results: Array<StepResult> = []

                        for (const step of steps) {
                            const stepResult = await this.chatMachine.runStep({
                                config: step,
                                idx: 0,
                            });
                            results.push({
                                id: step.id,
                                value: stepResult,
                            });
                        }
        
                        return results;
                    }, timeoutDuration, returnController.signal)

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
