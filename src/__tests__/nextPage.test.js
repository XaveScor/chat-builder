import {createPage, questionBubble, runChat, Stop} from '..'

it('correct constant scenario', done => {
    const startPage = createPage()
    const finalPage = createPage()

    startPage.use({
        steps: [
            {
                question: questionBubble,
                questionProps: {
                    question: '',
                }
            }
        ],
        nextPage: finalPage,
    })

    finalPage.use(() => {
        done()
        return {
            nextPage: Stop,
            steps: [],
        }
    })

    runConforms(startPage, {
        notifyView: () => {},
    })
})

it('correct function scenario', done => {
    const startPage = createPage()
    const finalPage = createPage()

    startPage.use({
        steps: [
            {
                question: questionBubble,
                questionProps: {
                    question: ''
                },
            }
        ],
        nextPage: () => finalPage,
    })

    finalPage.use(() => {
        done()
        return {
            nextPage: Stop,
            steps: [],
        }
    })

    runConforms(startPage, {
        notifyView: () => {},
    })
})