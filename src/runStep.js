// @flow
import type {NotifyViewEvent, DialogElement, PendingConfig} from './types';
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
    dialog: Array<DialogElement> = []
    notifyView: NotifyViewEvent
    pendingTimeout: ?TimeoutID = null
    pending: ?PendingConfig

    constructor(notifyView: NotifyViewEvent, pending?: PendingConfig) {
        this.notifyView = notifyView
        this.pending = pending
    }

    async showPending() {
        const pending = this.pending
        if (this.pendingTimeout == null && pending != null) {
            this.pendingTimeout = setTimeout(() => {
                this.dialog = [
                    ...this.dialog,
                    {
                        component: pending.pending,
                        props: pending.pendingProps,
                    }
                ]
                this.notifyView({
                    dialog: this.dialog,
                    input: {
                        component: pending.input,
                        props: {
                            ...pending.inputProps,
                            isAnswerable: false,
                        },
                    },
                })
            }, pending.pendingTimeout == null ? 500 : pending.pendingTimeout)
        }
    }

    async runStep({
        config,
        idx,
        editEvent,
    }: Args) {
        const questionProps = {
            ...config.questionProps,
        }
        let inputProps = {
            ...config.inputProps,
            isAnswerable: config.isAnswerable,
        }
        const pending = this.pending
        if (this.pendingTimeout != null && pending != null) {
            clearTimeout(this.pendingTimeout)
            this.pendingTimeout = null
            // clear last `pending` element
            this.dialog = this.dialog.filter(el => el.component !== pending.pending)
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
