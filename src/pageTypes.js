/* @flow */
export const Start: 'INTERNAL_Start' = 'INTERNAL_Start';
export const Repeat: 'INTERNAL_Repeat' = 'INTERNAL_Repeat';
export const Stop: 'INTERNAL_Stop' = 'INTERNAL_Stop';

export type PageType =
    | typeof Start
    | typeof Repeat
    | typeof Stop;
