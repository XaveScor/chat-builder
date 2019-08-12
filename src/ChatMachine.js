// @flow
import type {NotifyViewEvent, DialogElement, PendingConfig, State, StopEvent} from './types';
import type {Step, TimeoutConfig, NonAnswerableStep, AnswerableStep} from './createPage';
import type {Bubble, AnswerBubble} from './createBubble'
import {ValidationError} from './ValidationError'
import {voidF} from './common'
import type {EventType} from './event'

type Args = {|
    config: Step,
    orderId: number,
    onBackToPage: ?(void => void),
    pageId: number,
|}

type EnhancedDialogElement = {
    ...$Exact<DialogElement>,
    pageId: number,
}

const defaultTimeout = 500
const pendingId = -99999
export class ChatMachine {
    dialog: Array<EnhancedDialogElement> = []
    notifyView: NotifyViewEvent
    pendingTimeout: ?TimeoutID = null
    pending: ?PendingConfig
    stopEvent: ?StopEvent

    constructor(notifyView: NotifyViewEvent, pending: ?PendingConfig, stopEvent: ?StopEvent) {
        this.notifyView = notifyView
        this.pending = pending
        this.stopEvent = stopEvent
    }

    async notify(
        newDialogElement: DialogElement | null,
        input: $PropertyType<State, 'input'>,
        pageId: number,
    ) {
        if (newDialogElement != null) {
            this.dialog = [
                ...this.dialog,
                {
                    ...newDialogElement,
                    pageId,
                },
            ]
        }
        this.notifyView({
            dialog: this.dialog,
            input,
        })
    }

    async removeDialog(id: number) {
        this.dialog = this.dialog.filter(el => el.pageId < id)
    }

    async stop() {
        if (this.stopEvent) {
            this.stopEvent()
        }
    }

    async showPending() {
        const pending = this.pending
        if (this.pendingTimeout != null || pending == null) {
            return;
        }
        const {pendingTimeout} = pending
        const timeout = pendingTimeout || defaultTimeout

        this.pendingTimeout = setTimeout(() => {
            this.notify({
                component: pending.pending,
                props: pending.pendingProps,
            }, {
                component: pending.input,
                props: {
                    ...pending.inputProps,
                    isAnswerable: false,
                },
            }, pendingId)
        }, timeout)
    }

    async runAnswerableStep(
        config: AnswerableStep,
        orderId: number,
        onBackToPage: ?(void => void),
        pageId: number,
    ) {
        const inputProps = {
            ...config.inputProps,
            isAnswerable: true,
        }
        const validate = config.validate || (voidF: any => void)
        return new Promise(resolve => {
            const handleInputSubmit = (answer: any) => {
                const error = validate(answer)
                if (error instanceof ValidationError) {
                    return this.notify(null, {
                        component: config.input,
                        props: {
                            ...inputProps,
                            error: error.message,
                        }
                    }, pageId)
                }

                this.notify({
                    component: config.answer,
                    props: {
                        ...config.answerProps,
                        answer,
                        handleEditAnswer: null,
                        onBackToPage,
                        stepOrderId: orderId,
                    },
                }, {
                    component: config.input,
                    props: inputProps,
                }, pageId)

                const resultF = config.resultF || (_ => _)
                resolve(resultF(answer))
            }
            this.notify({
                component: config.question,
                props: {
                    ...config.questionProps,
                    onBackToPage,
                    stepOrderId: orderId,
                },
            }, {
                component: config.input,
                props: {
                    ...inputProps,
                    onSubmit: handleInputSubmit,
                },
            }, pageId)
        })
    }

    async runNonAnswerableStep(
        config: NonAnswerableStep,
        orderId: number,
        onBackToPage: ?(void => void),
        pageId: number,
    ) {
        await this.notify({
            component: config.question,
            props: {
                ...config.questionProps,
                onBackToPage,
                stepOrderId: orderId,
            },
        }, {
            component: config.input,
            props: {
                ...config.inputProps,
                isAnswerable: false,
            },
        }, pageId)
    }

    async runStep({
        config,
        orderId,
        onBackToPage,
        pageId,
    }: Args) {
        const pending = this.pending
        if (this.pendingTimeout != null && pending != null) {
            clearTimeout(this.pendingTimeout)
            this.pendingTimeout = null
            // clear last `pending` element
            this.dialog = this.dialog.filter(el => el.pageId !== pendingId)
        }

        return config.isAnswerable
            ? this.runAnswerableStep(config, orderId, onBackToPage, pageId)
            : this.runNonAnswerableStep(config, orderId, onBackToPage, pageId)
    }
}
