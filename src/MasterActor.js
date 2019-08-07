/* @flow */
import * as pageTypes from './pageTypes';
import {ChatMachine} from './ChatMachine';
import type {SendMessageToExecutorEvent, SendMessageToMasterEvent} from './types';
import {
    type PrevousPageResult,
    type MapPrevousPage,
    type NonFunction,
    type Config,
    Page
} from './createPage';
import {type WaitMessage} from './event';
import * as React from 'react';
import type {Props} from './createProps'
import {runWithTimeout, ReturnError} from './runWithTimeout'

async function callPrevousPageF<TProps, T: NonFunction>(
    map: MapPrevousPage<TProps, T>,
    result: PrevousPageResult<TProps>,
    getProps: void => TProps,
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
        chatMachine: ChatMachine
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
        };
    
        let currentPage = this.initPage;
        let lastConfig: Config<TProps> | null = null
        while (true) {
            if (!currentPage.schemeF) {
                throw new Error(`You should declare schemeF in ${currentPage.name || 'createPage'}.use method`);
            }
            const {schemeF, props} = currentPage;

            this.chatMachine.showPending()
            // TODO: fix flow type inference
            let currentPart: Config<TProps> = await callPrevousPageF(schemeF, result, props.getData);
            if (currentPart.nextPage === pageTypes.Repeat) {
                if (lastConfig == null) {
                    throw new Error(`You cannot use Repeat at init page`);
                }
                currentPart = lastConfig;
            }
            lastConfig = currentPart
            const {nextPage, steps, timeout} = currentPart;
    
            const duration = timeout != null ? timeout.duration : -1;

            this.sendMessageToExecutorEvent({
                type: 'showSteps',
                steps,
                timeoutDuration: duration,
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
            }
    
            if (currentPage === pageTypes.Stop) {
                this.chatMachine.stop()
                return
            }
        }
    }
}
