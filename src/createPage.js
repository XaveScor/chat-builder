/* @flow */

import type {PageType} from './pageTypes'
import type {SinglePhrase, TriplePhrase} from './createPhrase';
import * as React from 'react';
import type {EventType} from './event';
import type {ViewData} from './historyBlock';
import type {Input} from './createInput'
import {type Props, createProps} from './createProps'

type TotalPage<TProps> = Page<TProps> | PageType

export type StepResult = {
    id: any,
    value: any,
}

export type PrevousPageResult<TProps> = {
    prevousPage: TotalPage<TProps>,
    steps: $ReadOnlyArray<StepResult>,
};

type InputConfig<T: {}> = 
| {|
    component: Input<T>,
    props: T,
|}
| Input<{}>

export type SingleStep<T, Ti> = {|
    ...$Exact<SinglePhrase<T>>,
    question: T,
    id: any,
    input: InputConfig<Ti>,
|};

export type TripleStep<Tq, Ta, Te, Ti> = {|
    ...$Exact<TriplePhrase<Tq, Ta, Te>>,
    question: Tq,
    error: Te,
    id: any,
    input: InputConfig<Ti>,
|};

export type Step =
    | SingleStep<*, *>
    | TripleStep<*, *, *, *>

export type TimeoutConfig<TProps> = {|
    duration: number,
    page: TotalPage<TProps>,
|}

export type NonFunction = 
    | {}
    | string
    | number
    | boolean

export type MapPrevousPage<TProps, T: NonFunction> = 
    | ((PrevousPageResult<TProps>, TProps) => Promise<T> | T)
    | T

type NextPage<TProps> = MapPrevousPage<TProps, TotalPage<TProps>>

export type Config<TProps> = {|
    nextPage: NextPage<TProps>,
    steps: $ReadOnlyArray<Step>,
    timeout?: TimeoutConfig<TProps>,
|};

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

type CreatePageArg<TProps> = string | {|
    name?: string,
    props?: Props<TProps>,
|}
declare export function createPage(a?: string | {| name?: string |}): Page<{}>
declare export function createPage<TProps>({| name?: string, props: Props<TProps> |}): Page<TProps>
export function createPage<TProps: {}>(
    arg?: CreatePageArg<TProps>
): Page<TProps | {}> {
    if (typeof arg === 'string' || arg == null) {
        return new Page(arg, createProps())
    }
    const {name, props} = arg
    return new Page<any>(name, props || createProps())
}
