import { Store as RStore, Middleware as RMiddleware, Dispatch } from 'redux';
import { VariablesState, VariablesActionTypes } from './variables/types';
import { CommunicationActionTypes } from './comms/types';

export * from './variables/types';
export * from './comms/types';

export interface State {
  variables: VariablesState;
}

export type Actions = (
  VariablesActionTypes |
  CommunicationActionTypes
);

export type Store = RStore<State, Actions>;
export type Middleware = RMiddleware<{}, State, Dispatch>;
