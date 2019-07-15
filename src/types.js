// @flow
import type {EventType} from './event'
import * as React from 'react'

export type State = {
    dialog: Array<{
        component: React.ComponentType<any>,
        props: any,
    }>,
    input: {
        component: React.ComponentType<any>,
        props: any,
    },
}
export type NotifyViewEvent = EventType<State>;
export type StopEvent = EventType<void>
