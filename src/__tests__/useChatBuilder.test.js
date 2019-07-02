import {createPage, questionPhrase, simplePhrase, input, runConforms, createProps, Stop, useChatBuilder} from '..'
import * as React from 'react';
import * as renderer from 'react-test-renderer';

it('init props', done => {
    const value = {a: 'incorrect props sharing'}
    const shared = createProps(value)
    const page = createPage({
        props: shared,
    })

    page.use((_, props) => {
        return {
            steps: [
                {
                    ...simplePhrase,
                    input,
                    question: props.a
                }
            ],
            nextPage: Stop,
        }
    })

    const Component = () => {
        const Chat = useChatBuilder(page)

        return <Chat a='correct props sharing' />
    }

    const tree = renderer
        .create(<Component />)


    setTimeout(() => {
        const res = tree.toJSON()
        expect(res).toMatchSnapshot()
        done()
    }, 1000)
})