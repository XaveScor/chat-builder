import {createPage, runConforms, createProps, Stop} from '..'

it('init props', done => {
    const value = {}
    const shared = createProps(value)
    const page = createPage({
        props: shared,
    })

    page.use((_, props) => {
        expect(props).toBe(value)
        done()
        return {
            steps: [],
            nextPage: Stop,
        }
    })

    runConforms(page, {
        notifyView: () => {},
    })
})

it('change props during computation', done => {
    const oldProps = {a: 1};
    const newProps = {b: 2};
    const shared = createProps(oldProps)
    const page1 = createPage({
        props: shared,
    })
    const page2 = createPage({
        props: shared,
    })

    page1.use((_, props) => {
        expect(props).toBe(oldProps)
        shared.replace(newProps)
        return {
            steps: [],
            nextPage: page2,
        }
    })

    page2.use((_, props) => {
        expect(props).toBe(newProps)
        done()
        return {
            steps: [],
            nextPage: Stop,
        }
    })

    runConforms(page1, {
        notifyView: () => {},
    })
})