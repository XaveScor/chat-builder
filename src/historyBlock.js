// @flow
import * as React from 'react';
import {createEvent, type EventType} from './event';
import {ParseError} from './ParseError';
import type {SingleStep, TripleStep} from './createPage';

type CreateSingleHistoryBlockArgs = {
    config: SingleStep<*, *>,
};

type CreateTripleHistoryBlockArgs = {
    config: TripleStep<*, *, *, *>,
};

export function createSingleHistoryBlock({
    config,
}: CreateSingleHistoryBlockArgs) {
    const Component = () => React.createElement(config.component, {
        question: config.question,
    }, null);

    function getRenderComponent() {
        return Component;
    }

    function setAnswer(answer: string) {
        return true;
    }

    return {
        view: {
            setAnswer,
            getRenderComponent,
            Input: config.input,
        },
    }
}

type BlockListProps = {
    onAnswerClick: (() => void) | null,
    hideAnswer: boolean,
    onSelectElement: any => void,
}
type ValidBlockProps = {
    answer: string | null,
    onAnswerClick: (() => void) | null,
    onSelectElement: any => void,
}

export function createTripleHistoryBlock({
    config,
}: CreateTripleHistoryBlockArgs) {

    const invalidAnswers = [];
    let correctAnswer = null;

    const sendAnswerEvent = createEvent<any>();
    function setAnswer(answer: string) {
        const obj = config.parseAnswer(answer);
        if (obj instanceof ParseError) {
            invalidAnswers.push(answer);
            return;
        }
        correctAnswer = answer;
        sendAnswerEvent(obj);
    }

    const ValidBlock = ({answer, question, onAnswerClick, onSelectElement}: ValidBlockProps) => React.createElement(config.component, {
        question,
        answer,
        error: null,
        onAnswerClick,
        onSelectElement,
    }, null);

    const InvalidBlock = ({answer, question}) => React.createElement(config.component, {
        question,
        answer,
        error: config.error,
        onAnswerClick: null,
        onSelectElement: null,
    }, null);

    const BlockList = ({onAnswerClick, hideAnswer, onSelectElement}: BlockListProps) => {
        if (hideAnswer) {
            return <ValidBlock question={config.question} answer={null} onAnswerClick={null} onSelectElement={onSelectElement} />
        }
        return (
            <>
                {invalidAnswers.map((a, idx) => (
                    <InvalidBlock answer={a} key={idx} question={idx === 0 ? config.question : null} />
                ))}
                <ValidBlock question={null} answer={correctAnswer} onAnswerClick={onAnswerClick} onSelectElement={onSelectElement} />
            </>
        )
    }

    function getRenderComponent() {
        return BlockList;
    }

    function subscribeAnswer(callback: (answer: any) => void) {
        sendAnswerEvent.watch(callback);
    }

    return {
        view: {
            setAnswer,
            getRenderComponent,
            Input: config.input,
        },
        subscribeAnswer,
    }
}

export type ViewData = 
& $PropertyType<$Call<typeof createTripleHistoryBlock, CreateTripleHistoryBlockArgs>, 'view'>
& $PropertyType<$Call<typeof createSingleHistoryBlock, CreateSingleHistoryBlockArgs>, 'view'>
