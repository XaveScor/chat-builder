// @flow
import type {EventType} from './event';
import type {ViewData} from './historyBlock';

export type ValidateF = (string) => boolean;

export type NotifyViewEvent = EventType<ViewData>;
