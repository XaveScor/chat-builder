/* @flow */
import {createPage, runChat, createProps, Stop} from '..'

it('init props', done => {
    const value = {}
    const shared = createProps<{}>(value)
    const page = createPage<{}>({
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

    runChat(page, {
        notifyView: () => {},
    })
})

type Props = {a: number}
it('change props during computation', done => {
    const oldProps = {a: 1};
    const newProps = {a: 2};
    const shared = createProps<Props>(oldProps)
    const page1 = createPage<Props>({
        props: shared,
    })
    const page2 = createPage<Props>({
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

    runChat(page1, {
        notifyView: () => {},
    })
})