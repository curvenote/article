import {
  VariablesState, VariablesActionTypes,
  DefineVariable, Variable, VariableKinds, VariableTypes,
  ScopedVariableState,
  CREATE_VARIABLE, REMOVE_VARIABLE,
  UPDATE_VARIABLE_VALUE,
  CREATE_TRANSFORM, REMOVE_TRANSFORM,
} from './types';
import { RETURN_VARIABLES } from '../comms/types';
import { setVariables } from '../../utils';

const initialState: VariablesState = {
  scopes: {},
};

function convertValue(value: VariableTypes, type: VariableKinds): VariableTypes {
  switch (type) {
    case VariableKinds.number:
      return Number(value);
    case VariableKinds.string:
      return value;
    default:
      return value;
  }
}

function includeCurrentValue(variable: DefineVariable, current?: VariableTypes): Variable {
  const derived = variable.valueFunction !== '';
  return {
    ...variable,
    derived,
    value: derived ? null : convertValue(variable.value, variable.type),
    current: derived ? null : convertValue(current ?? variable.value, variable.type),
  };
}

const scopedVariableReducer = (
  state: ScopedVariableState,
  action: VariablesActionTypes,
): ScopedVariableState => {
  switch (action.type) {
    case CREATE_VARIABLE: {
      const { previous, variable } = action.payload;
      const newState = {
        ...state,
        variables: {
          ...state?.variables,
          [variable.name]: includeCurrentValue(variable),
        },
      };
      if (previous !== variable.name) {
        delete newState.variables[previous];
      }
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
          [name]: includeCurrentValue(variable, value),
        },
      };
    }
    case REMOVE_VARIABLE: {
      const { name } = action.payload;
      const newState = {
        ...state,
        variables: {
          ...state?.variables,
        },
      };
      delete newState.variables[name];
      return newState;
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
    default:
      return state;
  }
};


const variablesReducer = (
  state = initialState,
  action: VariablesActionTypes,
): VariablesState => {
  switch (action.type) {
    case CREATE_VARIABLE:
    case UPDATE_VARIABLE_VALUE:
    case REMOVE_VARIABLE:
    case CREATE_TRANSFORM:
    case REMOVE_TRANSFORM: {
      const { scope } = action.payload;
      const newScope = scopedVariableReducer(state.scopes[scope], action);
      return {
        ...state,
        scopes: {
          ...state.scopes,
          [scope]: {
            variables: { ...newScope.variables },
            transforms: { ...newScope.transforms },
          },
        },
      };
    }
    case RETURN_VARIABLES: {
      return setVariables(state, action.payload.variables);
    }
    default:
      return state;
  }
};

export default variablesReducer;
