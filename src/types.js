// @flow
import type {EventType} from './event'
import * as React from 'react'
import type {Pending} from './createPending'
import type {Input} from './createInput'

export type DialogElement = 
{
    component: React.ComponentType<mixed>,
    props: mixed,
}

export type State = {
    dialog: Array<DialogElement>,
    input?: {
        component: React.ComponentType<{}>,
        props: {},
    },
}
export type NotifyViewEvent = EventType<State>;
export type StopEvent = EventType<void>
type _PendingConfig<TInput: {}> = {
    pending: Pending,
    pendingProps?: {},
    pendingTimeout?: number,
    input: Input<TInput>,
    inputProps?: TInput,
}
export type PendingConfig = _PendingConfig<*>
export type BubbleContainer = React.ComponentType<{}>
