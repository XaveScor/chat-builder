/* @flow */
import {Page} from './createPage'
import * as React from 'react'
import {Chat} from './ReactChat'
import {areEqualShallow} from './shallowEqual'
import type {PendingConfig} from './types'
import {runChat} from './runChat'

function createComponent<TProps>(
    page: Page<TProps>,
    params?: {
        pending?: PendingConfig,
    },
): React.ComponentType<TProps> {
    const {props: propsWrapper} = page 
    return (props: TProps) => {
        if (propsWrapper.isEmpty()) {
            page.props.replace(props)
        } else {
            const oldProps = page.props.getData()
            if (!areEqualShallow(props, oldProps)) {
                page.props.replace(props)
            }
        }
        return <Chat
            runChat={runChat}
            page={page}
            pending={params?.pending}
        />
    }
}

type NonObject = string | number | boolean | void

declare export function useChatBuilder<T: NonObject>(page: Page<T>, params: any): React.ComponentType<{}>
declare export function useChatBuilder<T: {}>(page: Page<T>, params: any): React.ComponentType<T>
export function useChatBuilder<TProps>(
    page: Page<TProps>,
    params?: {
        pending?: PendingConfig,
    },
): React.ComponentType<TProps> {
    const componentRef = React.useRef<React.ComponentType<TProps> | null>(null)
    if (!componentRef.current) {
        componentRef.current = createComponent(page, params)
    }

    return componentRef.current
}