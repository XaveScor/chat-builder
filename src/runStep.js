// @flow
import type {NotifyViewEvent} from './types';
import type {Step, TimeoutConfig} from './createPage';
import {createSingleHistoryBlock, createTripleHistoryBlock} from './historyBlock';
import type {EditEvent} from './runConforms';

type Args = {|
    config: Step,
    notifyView: NotifyViewEvent,
    idx: number,
    editEvent: EditEvent,
|}

export async function runStep({
    config,
    notifyView,
    idx,
    editEvent,
}: Args) {
    if (config.type === 'single') {
        const historyBlock = createSingleHistoryBlock({
            config,
        });
        // $FlowFixMe
        notifyView(historyBlock.view);
        return '';
    }

    const historyBlock = createTripleHistoryBlock({
        config,
    });
    notifyView(historyBlock.view);
    
    let oldAnswer;
    historyBlock.subscribeAnswer(answer => {
        if (oldAnswer != null) {
            editEvent({
                id: idx,
                result: answer,
            });
        }
        oldAnswer = answer;
    })

    return new Promise(resolve => {
        historyBlock.subscribeAnswer(resolve);
    });
}
