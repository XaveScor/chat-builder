/* @flow */
import * as React from 'react'

type InputProps = {|
    onSubmit: void => void,
    onChange: string => void,
    value: string,
|}

export type Input = React.ComponentType<InputProps>

type CreateInputArg = {|
    component: Input,
|}
export function createInput({
    component,
}: CreateInputArg) {
    return component
}
