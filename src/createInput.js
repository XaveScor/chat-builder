/* @flow */
import * as React from 'react'

type InputProps<T> = {|
    ...$Exact<T>,
    onSubmit: void => void,
    isAnswerable: boolean,
    error: string,
|}

export type Input<T> = React.ComponentType<InputProps<T>>

type CreateInputArg<T> = {|
    component: Input<T>,
|}
export function createInput<T>({
    component,
}: CreateInputArg<T>) {
    return component
}
