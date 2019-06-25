/* @flow */
import {createPage} from './createPage'

export const Start = createPage('Start conforms');
export const Stop = createPage('Stop conforms');

export type PageType =
    | typeof Start
    | typeof Stop
