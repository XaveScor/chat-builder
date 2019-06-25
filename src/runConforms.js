// @flow
import * as pageTypes from './pageTypes';
import {runStep} from './runStep';
import type {NotifyViewEvent} from './types';
import {type StepResult, type PrevousPageResult, Page} from './createPage';
import {createEvent, type EventType} from './event';
import * as React from 'react';

export type EditEvent = EventType<{
    id: number,
    result: any,
}>

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

    const editEvent: EditEvent = createEvent();

    let currentPage = initPage;
    while (true) {
        const {name, schemeF} = currentPage;
        if (schemeF == null) {
            console.error(`You should declare schemeF in ${name || 'createPage'}.use method`);
            break;
        }
        const currentPart = await schemeF(result);
        if (currentPart.nextPage === pageTypes.Stop) {
            return;
        }

        const results: Array<StepResult> = [];
        const unsubscribe = editEvent.watch(res => {
            results[res.id].value = res.result;
        })

        for (let i = 0; i < currentPart.steps.length; ++i) {
            const step = currentPart.steps[i];
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

        result = {
            prevousPage: currentPage,
            steps: results,
        }
        currentPage = currentPart.nextPage
        unsubscribe();
    }
}
