/* @flow */
import * as React from 'react'
import { createInput } from '../createInput'

const Input = ({ value, onChange, onSubmit }) => {
	const changeHandler = React.useCallback((e: SyntheticInputEvent<>) => {
		onChange(e.target.value)
	})

	return (
		<>
			<input value={value} onChange={changeHandler} />
			<input type='submit' onClick={onSubmit} />
		</>
	)
}

export const input = createInput({
	component: Input,
})
