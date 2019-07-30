import * as React from 'react';
import {createPage, questionBubble, input, ConformsForm, Stop} from '..'
import * as renderer from 'react-test-renderer'

it('repeat', done => {
    const page = createPage()
    let count = 0
    page.use(() => {
        if (count === 2) {
            return {
                steps: [],
                nextPage: Stop,
            }
        }
        ++count;
        return {
            steps: [
                {
                    question: questionBubble,
                    questionProps: {
                        question: 'question',
                    },
                    input,
                }
            ],
            nextPage: page,
        }
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