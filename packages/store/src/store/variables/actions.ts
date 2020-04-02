import { Transform } from '../comms/types';
import {
  DefineVariable, VariablesActionTypes,
  VariableTypes,
  CREATE_VARIABLE, REMOVE_VARIABLE, UPDATE_VARIABLE_VALUE,
  CREATE_TRANSFORM, REMOVE_TRANSFORM,
} from './types';

export function createVariable(
  scope: string, previous: string, variable: DefineVariable,
): VariablesActionTypes {
  return {
    type: CREATE_VARIABLE,
    payload: {
      scope,
      variable,
      previous,
    },
  };
}

export function updateVariableValue(
  scope: string, name: string, value: VariableTypes,
): VariablesActionTypes {
  return {
    type: UPDATE_VARIABLE_VALUE,
    payload: {
      scope,
      name,
      value,
    },
  };
}

export function removeVariable(scope: string, name: string): VariablesActionTypes {
  return {
    type: REMOVE_VARIABLE,
    payload: {
      scope,
      name,
    },
  };
}

export function createTransform(
  scope: string, previous: string, transform: Transform,
): VariablesActionTypes {
  return {
    type: CREATE_TRANSFORM,
    payload: {
      scope,
      transform,
      previous,
    },
  };
}

export function removeTransform(
  scope: string, ids: string | string[],
): VariablesActionTypes {
  const payload = (typeof ids === 'string') ? { id: ids } : { ids };
  return {
    type: REMOVE_TRANSFORM,
    payload: {
      scope,
      ...payload,
    },
  };
}
