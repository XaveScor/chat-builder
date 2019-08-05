// @flow
import * as pageTypes from './pageTypes';
import {ChatMachine} from './ChatMachine';
import type {NotifyViewEvent, StopEvent, PendingConfig} from './types';
import {
    type StepResult,
    type PrevousPageResult,
    type MapPrevousPage,
    type NonFunction,
    type Config,
    Page
} from './createPage';
import {createEvent, type EventType} from './event';
import * as React from 'react';
import type {Props} from './createProps'
import {runWithTimeout} from './runWithTimeout'

export type EditEvent = EventType<{
    id: number,
    result: any,
}>

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

export async function runChat<TProps>(
    initPage: Page<TProps>,
    setup: {
        notifyView: NotifyViewEvent,
        stopEvent?: StopEvent,
        pending?: PendingConfig,
    },
) {
    let result: PrevousPageResult<TProps> = {
        prevousPage: pageTypes.Start,
        steps: [],
    };

    let currentPage = initPage;
    const machine = new ChatMachine(setup.notifyView, setup.pending)
    let lastConfig: Config<TProps> | null = null
    while (true) {
        if (!currentPage.schemeF) {
            throw new Error(`You should declare schemeF in ${currentPage.name || 'createPage'}.use method`);
        }
        const {schemeF, props} = currentPage;
        // TODO: fix flow type inference
        await machine.showPending()
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

        try {
            const res = await runWithTimeout(async (abortController) => {
                const results: Array<StepResult> = [];
                const editEvent: EditEvent = createEvent();
                const unsubscribe = editEvent.watch(res => {
                    results[res.id].value = res.result;
                })

                for (let i = 0; i < steps.length; ++i) {
                    const step = steps[i];
                    const stepResult = await machine.runStep({
                        config: step,
                        idx: i,
                        editEvent,
                    });
                    results.push({
                        id: step.id,
                        value: stepResult,
                    });
                }
                
                unsubscribe();

                return results;
            }, duration)

            result = {
                prevousPage: currentPage,
                steps: res,
            }
            currentPage = await callPrevousPageF(nextPage, result, props.getData)
        } catch (_) {
            result = {
                prevousPage: currentPage,
                steps: [],
            }
            if (timeout) {
                currentPage = timeout.page
            } else {
                currentPage = await callPrevousPageF(nextPage, result, props.getData)
            }
        }

        if (currentPage === pageTypes.Stop) {
            if (typeof setup.stopEvent === 'function') {
                setup.stopEvent()
            }
            return
        }
    }
}
export type RunChat = typeof runChat
