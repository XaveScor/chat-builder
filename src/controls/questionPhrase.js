// @flow

import * as React from 'react';
import {createTriplePhrase} from '../createPhrase';

const eq = _ => _;
const noop = () => {};
const component = ({
    question,
    answer,
    error,
    onAnswerClick,
    onSelectElement,
}) => (
    <>
        <p className='robot'>{question}</p>
        {answer && <p className='answer'>{
            error || !onAnswerClick ? 
                answer
                : <a onClick={onAnswerClick}>{answer}</a>
        }</p>}
        {error && <p className='error'>{error}</p>}
    </>
)

export const questionPhrase = createTriplePhrase<string, string, string>({
    component,
    parseAnswer: eq,
    stringifyAnswer: eq,
});
