// @flow

import * as React from 'react'
import {Page} from './createPage'
import {runConforms} from './runConforms'
import {createEvent} from './event'
import type {NotifyViewEvent, State} from './types'

const Dialog = ({views}) => views.map((v, idx) => {
    return <v.component {...v.props} key={idx} />
});

type Props<TProps> = {
    page: Page<TProps>,
}
export const ConformsForm = <TProps: {}>({page}: Props<TProps>) => {
    const [data, setData] = React.useState<State | void>();
    const [stopped, setStopped] = React.useState<boolean>(false)

    React.useLayoutEffect(() => {
        const notifyViewEvent: NotifyViewEvent = createEvent();
        const stopEvent = createEvent<void>()

        const unsubscribe = []
        unsubscribe.push(notifyViewEvent.watch(viewData => {
            setData(viewData);
        }))
        unsubscribe.push(stopEvent.watch(() => {
            setStopped(true)
        }))

        runConforms(page, {
            notifyView: notifyViewEvent,
            stopEvent,
        });

        return () => {
            unsubscribe.forEach(e => e())
        }
    }, []);

    if (!data) {
        return null
    }

    const {dialog, input} = data
    
    return <>
        <Dialog views={dialog} />
        {!stopped && <input.component {...input.props} key={dialog.length} />}
    </>
}