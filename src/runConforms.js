// @flow
import * as pageTypes from './pageTypes';
import {runStep} from './runStep';
import type {NotifyViewEvent} from './types';
import {type StepResult, type PrevousPageResult, type SchemeF, Page} from './createPage';
import {createEvent, type EventType} from './event';
import * as React from 'react';

export type EditEvent = EventType<{
    id: number,
    result: any,
}>

async function callSchemeF(result: PrevousPageResult, schemeF: SchemeF) {
    if (typeof schemeF === 'function') {
        return Promise.resolve(schemeF(result))
    }

    return schemeF
}

async function withTimeout<T>(f: () => Promise<T>, duration: number): Promise<T> {
    return new Promise((resolve, reject) => {
        let resolved = false;
        setTimeout(() => {
            if (!resolved) {
                resolved = true;
                reject()
            }
        }, duration)

        f().then(resolve).catch(reject)
    })
}

export async function runConforms(
    initPage: Page,
    viewEvents: {
        notifyView: NotifyViewEvent,
    },
) {
    let result: PrevousPageResult = {
        prevousPage: pageTypes.Start,
        steps: [],
    };

    let currentPage = initPage;
    while (true) {
        const {name, schemeF} = currentPage;
        if (schemeF == null) {
            console.error(`You should declare schemeF in ${name || 'createPage'}.use method`);
            break;
        }
        const currentPart = await callSchemeF(result, schemeF);
        const {nextPage, steps, timeout} = currentPart;

        const duration = timeout != null ? timeout.duration : 0;

        try {
            const res = await withTimeout(async () => {
                const results: Array<StepResult> = [];
                const editEvent: EditEvent = createEvent();
                const unsubscribe = editEvent.watch(res => {
                    results[res.id].value = res.result;
                })

                for (let i = 0; i < steps.length; ++i) {
                    const step = steps[i];
                    const stepResult = await runStep({
                        config: step,
                        notifyView: viewEvents.notifyView,
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
            currentPage = nextPage
        } catch (_) {
            result = {
                prevousPage: currentPage,
                steps: [],
            }
            currentPage = timeout ? timeout.page : nextPage
        }

        if (currentPage === pageTypes.Stop) {
            return;
        }
    }
}
