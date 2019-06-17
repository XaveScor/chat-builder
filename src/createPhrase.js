// @flow
import {createEvent, type EventType} from './event';
import * as React from 'react';
import {ParseError} from './ParseError';

type ParseAnswer<T> = (rawAnswer: string) => T | ParseError;
type StringifyAnswer<T> = (answer: T) => string;
type SingleComponent<Tq> = React.ComponentType<{
    question: Tq,
}>;
export type SinglePhrase<T> = {|
    type: "single",
    event: EventType<T>,
    component: SingleComponent<T>,
|};
type TripleComponent<Tq, Ta, Te> = React.ComponentType<{
    question: Tq,
    answer: Ta | null,
    error: Te | null,
    onAnswerClick: (() => void) | null,
    onSelectElement: ((Ta) => void) | null,
}>;
export type TriplePhrase<Tq, Ta, Te> = {|
    type: "triple",
    questionEvent: EventType<Tq>,
    answerEvent: EventType<Ta>,
    errorEvent: EventType<Te>,
    component: TripleComponent<Tq, Ta, Te>,
    parseAnswer: ParseAnswer<Ta>,
    stringifyAnswer: StringifyAnswer<Ta>,
|};

type CreateSinglePhraseArg<T> = {|
    component: SingleComponent<T>,
|}
export function createSinglePhrase<T>(
    arg: CreateSinglePhraseArg<T>
): SinglePhrase<T> {
    return {
        type: 'single',
        event: createEvent<T>(),
        component: arg.component,
    }
}

type CreateTriplePhraseArg<Tq, Ta, Tr> = {|
    component: TripleComponent<Tq, Ta, Tr>,
    parseAnswer: ParseAnswer<Ta>,
    stringifyAnswer: StringifyAnswer<Ta>,
|}
export function createTriplePhrase<Tq, Ta, Tr>(
    arg: CreateTriplePhraseArg<Tq, Ta, Tr>,
): TriplePhrase<Tq, Ta, Tr> {
    return {
        type: 'triple',
        questionEvent: createEvent<Tq>(),
        answerEvent: createEvent<Ta>(),
        errorEvent: createEvent<Tr>(),
        component: arg.component,
        parseAnswer: arg.parseAnswer,
        stringifyAnswer: arg.stringifyAnswer,
    }
}
