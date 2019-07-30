// @flow
import * as pageTypes from './pageTypes';
import {ChatMachine} from './runStep';
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

export type EditEvent = EventType<{
    id: number,
    result: any,
}>

async function callPrevousPageF<TProps: {}, T: NonFunction>(
    map: MapPrevousPage<TProps, T>,
    result: PrevousPageResult<TProps>,
    props: TProps,
): Promise<T> {
    if (typeof map === 'function') {
        return Promise.resolve(map(result, props))
    }

    return map
}

async function withTimeout<T>(f: () => Promise<T>, duration: number): Promise<T> {
    return new Promise((resolve, reject) => {
        let resolved = false;
        if (duration >= 0) {
            setTimeout(() => {
                if (!resolved) {
                    resolved = true;
                    reject()
                }
            }, duration)
        }

        f().then(resolve).catch(reject)
    })
}

export async function runConforms<TProps: {}>(
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
    while (true) {
        const {name, schemeF, props} = currentPage;
        if (schemeF == null) {
            console.error(`You should declare schemeF in ${name || 'createPage'}.use method`);
            break;
        }
        // TODO: fix flow type inference
        await machine.showPending()
        const currentPart: Config<TProps> = await callPrevousPageF(schemeF, result, props.getData());
        const {nextPage, steps, timeout} = currentPart;

        const duration = timeout != null ? timeout.duration : -1;

        try {
            const res = await withTimeout(async () => {
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
            currentPage = await callPrevousPageF(nextPage, result, props)
        } catch (_) {
            result = {
                prevousPage: currentPage,
                steps: [],
            }
            if (timeout) {
                currentPage = timeout.page
            } else {
                currentPage = await callPrevousPageF(nextPage, result, props)
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
