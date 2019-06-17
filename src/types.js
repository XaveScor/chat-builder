// @flow

import type {PageType} from './pageTypes';
import type {SinglePhrase, TriplePhrase} from './createPhrase';
import * as React from 'react';
import type {EventType} from './event';
import type {ViewData} from './historyBlock';

export type ValidateF = (string) => boolean;

export type SingleStep<T> = {|
    ...$Exact<SinglePhrase<T>>,
    question: T,
    id: any,
|};

export type TripleStep<Tq, Ta, Te> = {|
    ...$Exact<TriplePhrase<Tq, Ta, Te>>,
    question: Tq,
    error: Te,
    id: any,
|};

export type Step =
    | SingleStep<*>
    | TripleStep<*, *, *>

export type Config = {
    nextPage: string | PageType,
    steps: $ReadOnlyArray<Step>,
};

export type StepResult = {
    id: any,
    value: any,
}

export type PrevousPageResult = {
    prevousPage: string | PageType,
    steps: $ReadOnlyArray<StepResult>,
};

export type SchemeF = (PrevousPageResult) => Promise<Config>;

export type NotifyViewEvent = EventType<ViewData>;
