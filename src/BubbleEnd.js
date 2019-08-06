/* @flow */
import * as React from 'react'
import type {NotifyBubbleEndF} from './types'

export const context = React.createContext<NotifyBubbleEndF>(null)

type BubbleContainerEndProps = {
    children: React.Node,
}
export const BubbleContainerEnd = ({children}: BubbleContainerEndProps) => {
    const sendDataEvent = React.useContext(context)
    React.useLayoutEffect(() => {
        if (sendDataEvent != null) {
            sendDataEvent(children)
        }
        return () => {
            if (sendDataEvent) {
                sendDataEvent(null)
            }
        }
    }, [sendDataEvent, children])
    return null
}
