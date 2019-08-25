// @flow
import * as React from 'react'

type BubbleComponent<TProps: {}> = React.ComponentType<TProps>
type AnswerBubbleComponent<TProps: {}, TAns> = BubbleComponent<{
	...$Exact<TProps>,
	answer: TAns,
	handleEditAnswer: ?(void) => void,
	onBackToPage: ?(void) => void,
	stepOrderId: number,
}>
export type Bubble<TProps> = BubbleComponent<TProps>
export type AnswerBubble<TProps, TAns> = AnswerBubbleComponent<TProps, TAns>

type CreateBubbleArg<TProps> = {|
	component: BubbleComponent<TProps>,
|}
export function createBubble<TProps: {}>(arg: CreateBubbleArg<TProps>): Bubble<TProps> {
	return arg.component
}

type CreateAnswerBubbleArg<TProps, TAns> = {|
	component: AnswerBubbleComponent<TProps, TAns>,
|}
export function createAnswerBubble<TProps: {}, TAns>(
	arg: CreateAnswerBubbleArg<TProps, TAns>,
): AnswerBubble<TProps, TAns> {
	return arg.component
}
