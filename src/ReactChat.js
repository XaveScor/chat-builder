// @flow

import * as React from 'react'
import {Page} from './createPage'
import type {RunChat} from './runChat'
import {createEvent} from './event'
import type {NotifyViewEvent, State, PendingConfig, BubbleContainer} from './types'
import {context} from './BubbleEnd'

type DialogProps = {
    views: $PropertyType<State, 'dialog'>,
    pending?: $PropertyType<PendingConfig, 'pending'>,
    bubbleContainer?: BubbleContainer,
    bubbleEnd: React.Node,
}
const Dialog = ({views, pending: Pending, bubbleContainer: Container, bubbleEnd}: DialogProps) => {
    const list = Array.from(
        views.map((v, idx) => <v.component {...v.props} key={idx} />).values()
    )
    const totalView = <>
        {list}
        {bubbleEnd}
    </>

    if (Container != null) {
        return <Container>{totalView}</Container>
    }

    return totalView
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
    const [bubbleEnd, setBubbleEnd] = React.useState<React.Node>(null)

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
            bubbleEnd={bubbleEnd}
            bubbleContainer={bubbleContainer}
        />
        <context.Provider value={setBubbleEnd}>
            {!stopped && input && <input.component {...input.props} key={dialog.size} />}
        </context.Provider>
    </>
}