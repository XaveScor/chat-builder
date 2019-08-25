/* @flow */
import * as React from 'react'

export type Pending = React.ComponentType<any>

type CreatePendingArg = {
	component: Pending,
}

export function createPending(arg: CreatePendingArg) {
	return arg.component
}
