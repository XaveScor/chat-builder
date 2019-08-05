// @flow

import * as React from 'react'
import {Page} from './createPage'
import type {RunChat} from './runChat'
import {createEvent} from './event'
import type {NotifyViewEvent, State, PendingConfig} from './types'

type DialogProps = {
    views: $PropertyType<State, 'dialog'>,
    pending?: $PropertyType<PendingConfig, 'pending'>,
}
const Dialog = ({views, pending: Pending}: DialogProps) => views.map((v, idx) => {
    return <v.component {...v.props} key={idx} />
});

type Props<TProps> = {
    runChat: RunChat,
    page: Page<TProps>,
    pending?: PendingConfig,
}
export const Chat = <TProps>(props: Props<TProps>) => {
    const {page, pending, runChat} = props
    const [data, setData] = React.useState<State | void>();
    const [stopped, setStopped] = React.useState<boolean>(false)

    React.useLayoutEffect(() => {
        const notifyViewEvent: NotifyViewEvent = createEvent();
        const stopEvent = createEvent<void>()

        const unsubscribe: Array<() => void> = []
        unsubscribe.push(notifyViewEvent.watch(viewData => {
            setData(viewData);
        }))
        unsubscribe.push(stopEvent.watch(() => {
            setStopped(true)
        }))

        runChat(page, {
            notifyView: notifyViewEvent,
            stopEvent,
            pending,
        });

        return () => {
            unsubscribe.forEach(e => e())
        }
    }, [setData, setStopped, runChat, page, pending]);

    if (!data) {
        return null
    }

    const {dialog, input} = data
    
    return <>
        <Dialog
            views={dialog}
            pending={pending?.pending}
        />
        {!stopped && input && <input.component {...input.props} key={dialog.length} />}
    </>
}