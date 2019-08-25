// @flow

import * as React from 'react'
import { createBubble } from '../createBubble'

type ComponentProps = {
	question: string,
}
const component = ({ question }) => <p className='robot'>{question}</p>
export const questionBubble = createBubble<ComponentProps>({ component })
