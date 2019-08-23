// @flow
import type {PendingConfig, StopEvent} from './types';
import type {Step, TimeoutConfig, NonAnswerableStep, AnswerableStep} from './createPage';
import type {Bubble, AnswerBubble} from './createBubble'
import {ValidationError} from './ValidationError'
import {voidF} from './common'
import type {LowLevelChatMachine} from './LowLevelChatMachine'
import type {Id as MessageId} from './IdGenerator'

type Args = {|
    config: Step,
    orderId: number,
    onBackToPage: ?(void => mixed),
    pageId: number,
    onChange: ?(void => mixed),
|}

type PendingStartedType = {
    messageId: MessageId,
    timeoutId: TimeoutID,
}

const defaultTimeout = 500
export class ChatMachine {
    +lowLevelMachine: LowLevelChatMachine
    +pending: ?PendingConfig
    +stopEvent: ?StopEvent

    pendingStarted: ?PendingStartedType = null
    pageToMessageMapping = new Map<number, Set<MessageId>>()

    constructor(lowLevelMachine: LowLevelChatMachine, pending: ?PendingConfig, stopEvent: ?StopEvent) {
        this.lowLevelMachine = lowLevelMachine
        this.pending = pending
        this.stopEvent = stopEvent
    }

    async removeDialog(id: number) {
        const deletedPageIds: Array<number> = []
        const deletedMessageIds: Array<MessageId> = []
        for (const [pageId, messageIdSet] of this.pageToMessageMapping) {
            if (pageId < id) {
                continue
            }

            deletedMessageIds.push(...messageIdSet)
            deletedPageIds.push(pageId)
        }

        this.lowLevelMachine.delete(deletedMessageIds)
        for (const pageId of deletedPageIds) {
            this.pageToMessageMapping.delete(pageId)
        }
    }

    async stop() {
        if (this.stopEvent) {
            this.stopEvent()
        }
    }

    async showPending() {
        if (this.pendingStarted != null || this.pending == null) {
            return;
        }
        const {
            pendingTimeout = defaultTimeout,
            input,
            inputProps,
            pending,
            pendingProps,
        } = this.pending

        const inputConfig = {
            component: input,
            props: {
                ...inputProps,
                isAnswerable: false,
            },
        }

        // show only input
        const messageId = this.lowLevelMachine.push(null, inputConfig)

        const timeoutId = setTimeout(() => {
            this.lowLevelMachine.delete([messageId])

            const secondMessageId = this.lowLevelMachine.push({
                component: pending,
                props: pendingProps,
            }, inputConfig)

            this.pendingStarted = {
                messageId: secondMessageId,
                timeoutId,
            }
        }, pendingTimeout)

        this.pendingStarted = {
            messageId,
            timeoutId,
        }
    }

    async runAnswerableStep(
        config: AnswerableStep,
        orderId: number,
        onBackToPage: ?(void => mixed),
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
                    const errorMessageId = this.lowLevelMachine.push(null, {
                        component: config.input,
                        props: {
                            ...inputProps,
                            error: error.message,
                            onSubmit: handleInputSubmit,
                        }
                    })
                    this.saveMessageId(errorMessageId, pageId)
                    return 
                }

                const answerMessageId = this.lowLevelMachine.push({
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
                })
                this.saveMessageId(answerMessageId, pageId)

                const resultF = config.resultF || (_ => _)
                resolve(resultF(answer))
            }
            const questionMessageId = this.lowLevelMachine.push({
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
            })

            this.saveMessageId(questionMessageId, pageId)
        })
    }

    saveMessageId(messageId: MessageId, pageId: number) {
        let messagesSet = this.pageToMessageMapping.get(pageId)
        if (!messagesSet) {
            messagesSet = new Set<MessageId>()
            this.pageToMessageMapping.set(pageId, messagesSet)
        }
        messagesSet.add(messageId)
    }

    async runNonAnswerableStep(
        config: NonAnswerableStep,
        orderId: number,
        onBackToPage: ?(void => mixed),
        pageId: number,
    ) {
        const messageId = this.lowLevelMachine.push({
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
        })

        this.saveMessageId(messageId, pageId)
    }

    async runStep({
        config,
        orderId,
        onBackToPage,
        onChange,
        pageId,
    }: Args) {
        if (this.pendingStarted) {
            const {timeoutId, messageId} = this.pendingStarted
            clearTimeout(timeoutId)
            this.lowLevelMachine.delete([messageId])
            this.pendingStarted = null
        }

        return config.isAnswerable
            ? this.runAnswerableStep(config, orderId, onBackToPage, pageId)
            : this.runNonAnswerableStep(config, orderId, onBackToPage, pageId)
    }
}
