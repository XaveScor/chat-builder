/* @flow */
import {Page} from './createPage'
import * as React from 'react'
import {Chat} from './ReactChat'
import {areEqualShallow} from './shallowEqual'
import type {PendingConfig, BubbleContainer} from './types'
import {type RunChat, runChat} from './runChat'

type ExtendedTProps<TProps> = {
    ...$Exact<TProps>,
    runChat?: RunChat,
}
function createComponent<TProps: {}>(
    page: Page<TProps>,
    params?: {
        pending?: PendingConfig,
        bubbleContainer?: BubbleContainer,
    },
): React.ComponentType<ExtendedTProps<TProps>> {
    const {props: propsWrapper} = page 
    return (props: ExtendedTProps<TProps>) => {
        const runChatProps: RunChat = props.runChat || runChat
        if (propsWrapper.isEmpty()) {
            page.props.replace(props)
        } else {
            const oldProps = page.props.getData()
            if (!areEqualShallow(props, oldProps)) {
                page.props.replace(props)
            }
        }
        return <Chat
            runChat={runChatProps}
            page={page}
            pending={params?.pending}
            bubbleContainer={params?.bubbleContainer}
        />
    }
}

type NonObject = string | number | boolean | void

declare export function useChatBuilder<T: NonObject>(page: Page<T>, params: any): React.ComponentType<{}>
declare export function useChatBuilder<T: {}>(page: Page<T>, params: any): React.ComponentType<T>
export function useChatBuilder<TProps: {}>(
    page: Page<TProps>,
    params?: {
        pending?: PendingConfig,
    },
): React.ComponentType<ExtendedTProps<TProps>> {
    const componentRef = React.useRef<React.ComponentType<ExtendedTProps<TProps>> | null>(null)
    if (!componentRef.current) {
        componentRef.current = createComponent<TProps>(page, params)
    }

    return componentRef.current
}