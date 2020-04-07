import {
  VariablesState,
  VariablesActionTypes,
  DEFINE_VARIABLE, REMOVE_VARIABLE,
} from './types';
import { RETURN_RESULTS } from '../comms/types';
import {
  includeCurrentValue, testScopeAndName, unpackCurrent,
} from './utils';
import { compareDefine, compareEval } from '../utils';

const initialState: VariablesState = {};

const variablesReducer = (
  state: VariablesState = initialState,
  action: VariablesActionTypes,
): VariablesState => {
  switch (action.type) {
    case DEFINE_VARIABLE: {
      const variable = action.payload;
      const { scope, name } = variable;
      if (!testScopeAndName(scope, name)) throw new Error('Scope or name has bad characters');
      const current = state[variable.id];
      const next = includeCurrentValue(variable, variable.type);
      if (compareDefine(current, next)) return state;
      const newState = {
        ...state,
        [variable.id]: next,
      };
      return newState;
    }
    case REMOVE_VARIABLE: {
      const { id } = action.payload;
      if (state[id] == null) return state;
      const newState = {
        ...state,
      };
      delete newState[id];
      return newState;
    }
    case RETURN_RESULTS: {
      const newState = {
        ...state,
      };
      const oneChange = { current: false };
      Object.entries(action.payload.results.variables).forEach(([id, value]) => {
        if (newState[id] == null) return;
        const next = unpackCurrent(newState[id], value);
        if (compareEval(newState[id], next)) return;
        newState[id] = next;
        oneChange.current = true;
      });
      if (!oneChange.current) return state;
      return newState;
    }
    default:
      return state;
  }
};

export default variablesReducer;
