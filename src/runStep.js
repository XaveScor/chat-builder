// @flow
import type {NotifyViewEvent} from './types';
import type {Step, TimeoutConfig} from './createPage';
import type {EditEvent} from './runConforms';
import type {Bubble, AnswerBubble} from './createBubble'
import {ValidationError} from './ValidationError'

type Args = {|
    config: Step,
    idx: number,
    editEvent: EditEvent,
|}

export class ChatMachine {
    dialog: Array<{component: any, props: any}> = []
    notifyView: NotifyViewEvent

    constructor(notifyView: NotifyViewEvent) {
        this.notifyView = notifyView
    }

    async runStep({
        config,
        idx,
        editEvent,
    }: Args) {
        const questionProps = {
            ...config.questionProps,
            key: idx,
        }
        let inputProps = {
            ...config.inputProps,
            key: idx,
            isAnswerable: config.isAnswerable,
        }
        return new Promise(resolve => {
            if (!config.isAnswerable) {
                this.dialog = [
                    ...this.dialog,
                    {
                        component: config.question,
                        props: questionProps,
                    },
                ]
        
                this.notifyView({
                    dialog: this.dialog,
                    input: {
                        component: config.input,
                        props: inputProps,
                    }
                })

                resolve()
                return
            }

            this.dialog = [
                ...this.dialog,
                {
                    component: config.question,
                    props: questionProps,
                },
            ]

            const handleInputSubmit = (answer: any) => {
                if (config.validate) {
                    const error = config.validate(answer)
                    if (error instanceof ValidationError) {
                        this.notifyView({
                            dialog: this.dialog,
                            input: {
                                component: config.input,
                                props: {
                                    ...inputProps,
                                    error: error.message,
                                }
                            }
                        })
                        return
                    }
                }

                this.dialog = [
                    ...this.dialog,
                    {
                        component: config.answer,
                        props: {
                            ...config.answerProps,
                            answer,
                            handleEditAnswer: null,
                        },
                    }
                ]

                this.notifyView({
                    dialog: this.dialog,
                    input: {
                        component: config.input,
                        props: inputProps,
                    }
                })

                resolve(answer)
            }

            inputProps = {
                ...inputProps,
                onSubmit: handleInputSubmit,
            }

            this.notifyView({
                dialog: this.dialog,
                input: {
                    component: config.input,
                    props: inputProps,
                }
            })
        })
    }
}
