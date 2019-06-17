// @flow

import * as React from 'react';
import {createSinglePhrase} from '../createPhrase';

const component = ({question}) => <p className='robot'>{question}</p>
export const simplePhrase = createSinglePhrase<string>({component});
