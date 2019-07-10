/* @flow */
import * as React from 'react'

type InputProps<T> = {|
    ...$Exact<T>,
    onSubmit: void => void,
    onChange: string => void,
    value: string,
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
