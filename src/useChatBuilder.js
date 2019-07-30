/* @flow */
import {Page} from './createPage'
import * as React from 'react'
import {ConformsForm} from './ReactForm'
import {areEqualShallow} from './shallowEqual'
import type {PendingConfig} from './types'

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
        return <ConformsForm
            page={page}
            pending={params?.pending}
        />
    }
}

declare export function useChatBuilder<TProps: {}>(
    page: Page<TProps>,
): React.ComponentType<TProps>

export function useChatBuilder<TProps: {}>(
    page: Page<TProps>
): React.ComponentType<TProps> {
    const componentRef = React.useRef<React.ComponentType<TProps> | null>(null)
    if (!componentRef.current) {
        componentRef.current = createComponent(page)
    }

    return componentRef.current
}