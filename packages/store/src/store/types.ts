import {
  Store as RStore,
  Middleware as RMiddleware,
  Reducer as RReducer,
  Action,
} from 'redux';
import { ThunkAction, ThunkDispatch } from 'redux-thunk';

import { VariablesState, VariablesActionTypes } from './variables/types';
import { ComponentsState, ComponentActionTypes } from './components/types';
import { CommunicationActionTypes } from './comms/types';

export * from './variables/types';
export * from './comms/types';

export interface State {
  variables: VariablesState;
  components: ComponentsState;
}

export type Actions = (
  VariablesActionTypes |
  ComponentActionTypes |
  CommunicationActionTypes
);

export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, State, null, Action<Actions['type']>>;
export type Dispatch = ThunkDispatch<State, null, Action<Actions['type']>>;
export type Store = RStore<State, Actions> & { dispatch: Dispatch; };
export type Middleware = RMiddleware<{}, State, Dispatch>;
export type Reducer = RReducer<State, Actions>;
