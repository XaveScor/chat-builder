/* @flow */
import {Page} from './createPage'
import * as React from 'react'
import {ConformsForm} from './ReactForm'
import {areEqualShallow} from './shallowEqual'

function EmptyComponent<T>(a: T) {
    return 'invalidComponent'
}
export function useChatBuilder<TProps: {}>(
    page: Page<TProps>
): React.ComponentType<TProps> {
    const firstLoad = React.useRef(true)
    const componentRef = React.useRef<React.ComponentType<TProps>>(EmptyComponent)
    if (firstLoad.current) {
        firstLoad.current = false
        let oldProps = page.props.getData();
        componentRef.current = (props: TProps) => {
            if (!areEqualShallow(props, oldProps)) {
                page.props.replace(props)
                oldProps = props
            }
            return <ConformsForm page={page} />
        }
    }

    return componentRef.current
}