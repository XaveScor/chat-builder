import * as React from 'react';
import {createPage, questionBubble, input, ConformsForm, Stop, Repeat} from '..'
import * as renderer from 'react-test-renderer'

it('repeat', done => {
    const page = createPage()
    const repeatPage = createPage()
    let count = 0
    page.use({
        steps: [
            {
                question: questionBubble,
                questionProps: {
                    question: 'question',
                },
                input,
            }
        ],
        nextPage: () => {
            if (count === 2) {
                return Stop
            }
            ++count
            return repeatPage
        }
    })
    repeatPage.use({
        steps: [],
        nextPage: Repeat,
    })
    let tree
    renderer.act(() => {
        tree = renderer.create(<ConformsForm page={page} />)
    })
        
    setTimeout(() => {
        const res = tree.toJSON()
        expect(res).toMatchSnapshot()
        done()
    }, 1000)
});