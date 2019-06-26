import {createPage, questionPhrase, runConforms, Stop} from '..'

it('correct scenario', done => {
    const page = createPage()
    const timeoutPage = createPage()

    page.use({
        steps: [
            {
                ...questionPhrase,
                question: '',
                error: ''
            }
        ],
        nextPage: Stop,
        timeout: {
            duration: 50,
            page: timeoutPage,
        },
    })

    timeoutPage.use(() => {
        done()
        return {
            nextPage: Stop,
            steps: [],
        }
    })

    runConforms(page, {
        notifyView: () => {},
    })
})