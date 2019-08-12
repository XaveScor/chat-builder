// @flow
import type {EventType} from './event'
import * as React from 'react'
import type {Pending} from './createPending'
import type {Input} from './createInput'
import type {Config, StepResult} from './createPage'

export type DialogElement = 
{
    component: React.ComponentType<mixed>,
    props: mixed,
}

export type State = {
    dialog: $ReadOnlyArray<DialogElement>,
    input?: {
        component: React.ComponentType<{}>,
        props: {},
    },
}
export type NotifyBubbleEndF = (React.Node => void) | null
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

type MasterMessages =
| {
    type: 'showSteps',
    steps: $PropertyType<Config<*>, 'steps'>,
    timeoutDuration: number,
    isReturnable: boolean,
    pageId: number,
}
export type SendMessageToExecutorEvent = EventType<MasterMessages>

type ExecutorMessages = 
| {
    type: 'steps',
    results: $ReadOnlyArray<StepResult>,
}
| {
    type: 'timeout'
}
| {
    type: 'back',
    pageId: number,
}
export type SendMessageToMasterEvent = EventType<ExecutorMessages>
