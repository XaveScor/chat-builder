import {createPage, questionPhrase, input, Stop, ConformsForm, ParseError} from '..'
import * as React from 'react';
import * as renderer from 'react-test-renderer';

it('hide question on invalid answer', done => {
    const page = createPage()

    page.use((_, props) => {
        return {
            steps: [
                {
                    ...questionPhrase,
                    input,
                    question: 'Question',
                    error: 'Error',
                    parseAnswer: answer => new ParseError('Error'),
                }
            ],
            nextPage: Stop,
        }
    })

    const tree = renderer
        .create(<ConformsForm page={page} />)

    setTimeout(() => {
        const inputInstance = tree.root.findByType(input)
        inputInstance.props.onChange('asd')
        inputInstance.props.onSubmit()
        
        setTimeout(() => {
            const res = tree.toJSON()
            expect(res).toMatchSnapshot()
            done()
        }, 1000)
    }, 1000)
})