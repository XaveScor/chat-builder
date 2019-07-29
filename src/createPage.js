/* @flow */

import type {PageType} from './pageTypes'
import type {Bubble, AnswerBubble} from './createBubble'
import * as React from 'react';
import type {EventType} from './event'
import type {Input} from './createInput'
import {type Props, createProps} from './createProps'
import {ValidationError} from '.'

type TotalPage<TProps> = Page<TProps> | PageType

export type StepResult = {
    id: any,
    value: any,
}

export type PrevousPageResult<TProps> = {
    prevousPage: TotalPage<TProps>,
    steps: $ReadOnlyArray<StepResult>,
};

export type InternalStep<TProps, TAns, TPropsAns, TErr, TInput> = 
| {|
    id: any,
    question: Bubble<TProps>,
    questionProps?: TProps,
    isAnswerable: false,
    input: Input<TInput>,
    inputProps?: TInput,
|}
| {|
    id: any,
    question: Bubble<TProps>,
    questionProps?: TProps,
    isAnswerable: true,
    validate: TAns => (ValidationError | void),
    answer: AnswerBubble<TPropsAns, TAns>,
    answerProps?: TPropsAns,
    input: Input<TInput>,
    inputProps?: TInput,
|}

export type Step = InternalStep<*, *, *, *, *>

export type TimeoutConfig<TProps> = {|
    duration: number,
    page: TotalPage<TProps>,
|}

export type NonFunction = 
    | {}
    | string
    | number
    | boolean

type MapPrevousPageF<TProps, T: NonFunction> = ((PrevousPageResult<TProps>, TProps) => Promise<T> | T) 
export type MapPrevousPage<TProps, T: NonFunction> = 
    | MapPrevousPageF<TProps, T>
    | T

type NextPage<TProps> = MapPrevousPage<TProps, TotalPage<TProps>>

export type Config<TProps> = {|
    nextPage: NextPage<TProps>,
    steps: $ReadOnlyArray<Step>,
    timeout?: TimeoutConfig<TProps>,
|};

type SchemeFunction<TProps> = MapPrevousPageF<TProps, Config<TProps>>
export type SchemeF<TProps> = MapPrevousPage<TProps, Config<TProps>>

export class Page<TProps: {}> {
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
declare export function createPage(a?: string | {| name?: string |}): Page<{}>
declare export function createPage<TProps>({| name?: string, props: Props<TProps> |} | SchemeFunction<TProps>): Page<TProps>
export function createPage<TProps: {}>(
    arg?: CreatePageArg<TProps>
): Page<TProps | {}> {
    if (typeof arg === 'string' || arg == null) {
        return new Page(arg, createProps())
    }
    if (typeof arg === 'function') {
        const page = new Page(null, createProps())
        page.use(arg)
        return page
    }
    const {name, props} = arg
    return new Page<any>(name, props || createProps())
}
