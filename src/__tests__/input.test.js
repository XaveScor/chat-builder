import * as React from 'react';
import {createPage, questionBubble, input, Stop, answerBubble, runChat} from '..'
import {Chat} from '../ReactChat'
import * as renderer from 'react-test-renderer'

async function delay(timeout) {
    return new Promise(resolve => {
      setTimeout(resolve, timeout);
    });
  }

it('renders correctly', done => {
    const startPage = createPage()

    startPage.use({
        steps: [
            {
                question: questionBubble,
                questionProps: {
                    question: '',
                },
                input,
            }
        ],
        nextPage: Stop,
    })
    let tree
    renderer.act(() => {
        tree = renderer.create(<Chat runChat={runChat} page={startPage} />)
    })
        
    setTimeout(() => {
        const res = tree.toJSON()
        expect(res).toMatchSnapshot()
        done()
    }, 1000)
});

it('input with props', done => {
    const startPage = createPage()

    const CustomInput = ({a}) => `custom Input with a, value: ${a}`

    startPage.use({
        steps: [
            {
                question: questionBubble,
                questionProps: {
                    question: '123',
                },
                isAnswerable: true,
                input: CustomInput,
                inputProps: {
                    a: 1,
                },
            }
        ],
        nextPage: Stop,
    })
    let tree
    renderer.act(() => {
        tree = renderer.create(<Chat runChat={runChat} page={startPage} />)
    })

    setTimeout(() => {
        const res = tree.toJSON()
        expect(res).toMatchSnapshot()
        done()
    }, 1000)
});
