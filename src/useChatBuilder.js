/* @flow */
import {Page} from './createPage'
import * as React from 'react'
import {Chat} from './ReactChat'
import {areEqualShallow} from './shallowEqual'
import type {PendingConfig} from './types'
import {runChat} from './runChat'

function createComponent<TProps: {}>(
    page: Page<TProps>,
    params?: {
        pending?: PendingConfig,
    },
): React.ComponentType<TProps> {
    let oldProps = page.props.getData()
    return (props: TProps) => {
        if (!areEqualShallow(props, oldProps)) {
            page.props.replace(props)
            oldProps = props
        }
        return <Chat
            runChat={runChat}
            page={page}
            pending={params?.pending}
        />
    }
}

export function useChatBuilder<TProps: {}>(
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