import * as React from 'react';
import {createPage, simplePhrase, input, ConformsForm, Stop} from '..'
import * as renderer from 'react-test-renderer';

async function delay(timeout) {
    return new Promise(resolve => {
      setTimeout(resolve, timeout);
    });
  }
// Wait react-test-renderer 18.9.0 stable
it('renders correctly', done => {
    const startPage = createPage()

    startPage.use({
        steps: [
            {
                ...simplePhrase,
                question: '',
                input,
            }
        ],
        nextPage: Stop,
    })
    const tree = renderer
        .create(<ConformsForm page={startPage} />)
        
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
                ...simplePhrase,
                question: '',
                input: {
                    component: CustomInput,
                    props: {
                        a: 1,
                    }
                },
            }
        ],
        nextPage: Stop,
    })
    const tree = renderer
        .create(<ConformsForm page={startPage} />)
        
    setTimeout(() => {
        const res = tree.toJSON()
        expect(res).toMatchSnapshot()
        done()
    }, 1000)
});
