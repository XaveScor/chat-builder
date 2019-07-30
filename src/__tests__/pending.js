import * as React from 'react';
import {createPage, ConformsForm, createPending, input, Stop, questionBubble} from '..'
import * as renderer from 'react-test-renderer'

async function delay(timeout) {
    return new Promise(resolve => {
      setTimeout(resolve, timeout);
    });
  }

const pending = createPending({
    component: () => 'pending',
})
const pendingConfig = {
    pending,
    input,
}

it('renders correctly', done => {
    const startPage = createPage(async () => {
        await delay(700)
        return {
            steps: [
                {
                    question: questionBubble,
                    questionProps: {
                        question: 'question',
                    },
                    input,
                },
            ],
            nextPage: Stop,
        }
    })

    let tree
    renderer.act(() => {
        tree = renderer
            .create(<ConformsForm page={startPage} pending={pendingConfig} />)
    })
    
    setTimeout(() => {
        const res = tree.toJSON()
        expect(res).toMatchSnapshot()
        setTimeout(() => {
            const res = tree.toJSON()
            expect(res).toMatchSnapshot()
            done()
        }, 700)
    }, 600)
});