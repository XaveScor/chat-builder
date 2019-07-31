import {createPage, runConforms, createProps, Stop} from '..'

it('init props', done => {
    const value = {}
    const shared = createProps(value)
    const page = createPage({
        props: shared,
    })

    page.use((_, getProps) => {
        expect(getProps()).toBe(value)
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

    page1.use((_, getProps) => {
        expect(getProps()).toBe(oldProps)
        shared.replace(newProps)
        return {
            steps: [],
            nextPage: page2,
        }
    })

    page2.use((_, getProps) => {
        expect(getProps()).toBe(newProps)
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