// @flow

import * as React from 'react'
import {Page} from './createPage'
import type {RunChat} from './runChat'
import {createEvent} from './event'
import type {NotifyViewEvent, State, PendingConfig, BubbleContainer} from './types'

type DialogProps = {
    views: $PropertyType<State, 'dialog'>,
    pending?: $PropertyType<PendingConfig, 'pending'>,
    bubbleContainer?: BubbleContainer,
}
const Dialog = ({views, pending: Pending, bubbleContainer: Container}: DialogProps) => {
    const list = views.map((v, idx) => <v.component {...v.props} key={idx} />)

    if (Container != null) {
        return <Container>{list}</Container>
    }

    return list
};

type Props<TProps> = {
    runChat: RunChat,
    page: Page<TProps>,
    pending?: PendingConfig,
    bubbleContainer?: BubbleContainer,
}
export const Chat = <TProps>(props: Props<TProps>) => {
    const {page, pending, runChat, bubbleContainer} = props
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
            bubbleContainer={bubbleContainer}
        />
        {!stopped && input && <input.component {...input.props} key={dialog.length} />}
    </>
}