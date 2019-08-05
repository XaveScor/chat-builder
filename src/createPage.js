/* @flow */

import type {Bubble, AnswerBubble} from './createBubble'
import * as React from 'react';
import type {EventType} from './event'
import type {Input} from './createInput'
import {type Props, createProps} from './createProps'
import {ValidationError} from './ValidationError'

export type StepResult = {
    id: any,
    value: any,
}

export type PrevousPageResult<TProps> = {
    prevousPage: Page<TProps>,
    steps: $ReadOnlyArray<StepResult>,
};

type InternalNonAnswerableStep<TProps, TInput> = {|
    id?: any,
    question: Bubble<TProps>,
    questionProps?: TProps,
    isAnswerable?: false,
    input: Input<TInput>,
    inputProps?: TInput,
|}

type InternalAnswerableStep<TProps, TAns, TPropsAns, TErr, TInput> = {|
    id?: any,
    question: Bubble<TProps>,
    questionProps?: TProps,
    isAnswerable: true,
    validate?: TAns => (ValidationError | void),
    answer: AnswerBubble<TPropsAns, TAns>,
    answerProps?: TPropsAns,
    input: Input<TInput>,
    inputProps?: TInput,
|}

export type InternalStep<TProps, TAns, TPropsAns, TErr, TInput> = 
| InternalNonAnswerableStep<TProps, TInput>
| InternalAnswerableStep<TProps, TAns, TPropsAns, TErr, TInput>

export type Step = InternalStep<*, *, *, *, *>
export type NonAnswerableStep = InternalNonAnswerableStep<*, *>
export type AnswerableStep = InternalAnswerableStep<*, *, *, *, *>

export type TimeoutConfig<TProps> = {|
    duration: number,
    page: Page<TProps>,
|}

export type NonFunction = 
    | {}
    | string
    | number
    | boolean

type MapPrevousPageF<TProps, T: NonFunction> = (PrevousPageResult<TProps>, void => TProps) => (Promise<T> | T) 
export type MapPrevousPage<TProps, T: NonFunction> = 
    | MapPrevousPageF<TProps, T>
    | T

type NextPage<TProps> = MapPrevousPage<TProps, Page<TProps>>

export type Config<TProps> = {|
    nextPage: NextPage<TProps>,
    steps: $ReadOnlyArray<Step>,
    timeout?: TimeoutConfig<TProps>,
|};

type SchemeFunction<TProps> = MapPrevousPageF<TProps, Config<TProps>>
export type SchemeF<TProps> = MapPrevousPage<TProps, Config<TProps>>

export class Page<TProps> {
    +name: ?string
    schemeF: ?SchemeF<TProps>
    +props: Props<TProps>
    constructor(name?: ?string, props: Props<TProps>) {
        this.name = name
        this.props = props
    }

    use(schemeF: SchemeF<TProps>) {
        this.schemeF = schemeF
    }
}

type CreatePageArg<TProps> = string | SchemeFunction<TProps> | {|
    name?: string,
    props?: Props<TProps>,
|}
export function createPage<TProps>(
    arg?: CreatePageArg<TProps>
): Page<TProps> {
    if (typeof arg === 'string' || arg == null) {
        return new Page<any>(arg, createProps())
    }
    if (typeof arg === 'function') {
        const page = new Page<TProps>(null, createProps<TProps>())
        page.use(arg)
        return page
    }
    const {name, props} = arg
    return new Page<TProps>(name, props || createProps<TProps>())
}
