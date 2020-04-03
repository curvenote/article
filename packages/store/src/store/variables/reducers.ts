import {
  VariablesState,
  VariablesActionTypes,
  DEFINE_VARIABLE, REMOVE_VARIABLE,
  UPDATE_VARIABLE_VALUE,
  CREATE_TRANSFORM, REMOVE_TRANSFORM,
} from './types';
import { RETURN_VARIABLES } from '../comms/types';
import { setVariables } from './selectors';
import { includeCurrentValue, testScopeAndName } from './utils';

const initialState: VariablesState = {
  variables: {},
  transforms: {},
};


const variablesReducer = (
  state: VariablesState = initialState,
  action: VariablesActionTypes,
): VariablesState => {
  switch (action.type) {
    case DEFINE_VARIABLE: {
      const variable = action.payload;
      const { scope, name } = variable;
      if (!testScopeAndName(scope, name)) throw new Error('Scope or name has bad characters');
      const newState = {
        ...state,
        variables: {
          ...state?.variables,
          [variable.id]: includeCurrentValue(variable, variable.type),
        },
      };
      return newState;
    }
    case REMOVE_VARIABLE: {
      const { id } = action.payload;
      const newState = {
        ...state,
        variables: {
          ...state?.variables,
        },
      };
      delete newState.variables[id];
      return newState;
    }
    case UPDATE_VARIABLE_VALUE: {
      const { name, value } = action.payload;
      const variable = state?.variables[name];
      if (variable == null) throw new Error('No variable.');
      if (variable.derived) throw new Error('Cannot update a derived variable.');
      return {
        ...state,
        variables: {
          ...state?.variables,
          [name]: includeCurrentValue(variable, variable.type, value),
        },
      };
    }
    case CREATE_TRANSFORM: {
      const { previous, transform } = action.payload;
      const newState = {
        ...state,
        transforms: {
          ...state?.transforms,
          [transform.id]: { ...transform, current: null },
        },
      };
      if (previous !== transform.id) {
        delete newState.transforms[previous];
      }
      return newState;
    }
    case REMOVE_TRANSFORM: {
      const { id, ids } = action.payload;
      const newState = {
        ...state,
        transforms: {
          ...state?.transforms,
        },
      };
      if (id) {
        delete newState.transforms[id];
      }
      if (ids) {
        ids.forEach((key) => {
          delete newState.transforms[key];
        });
      }
      return newState;
    }
    case RETURN_VARIABLES: {
      return setVariables(state, action.payload.variables);
    }
    default:
      return state;
  }
};

export default variablesReducer;
