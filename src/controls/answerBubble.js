// @flow

import * as React from 'react'
import { createAnswerBubble } from '../createBubble'

const component = ({ answer, handleEditAnswer }) =>
	answer && <p className='answer'>{!handleEditAnswer ? answer : <a onClick={handleEditAnswer}>{answer}</a>}</p>

export const answerBubble = createAnswerBubble<{}, string>({
	component,
})
