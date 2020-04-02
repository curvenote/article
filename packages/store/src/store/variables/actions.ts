import { v4 as uuid } from 'uuid';
import { Transform } from '../comms/types';
import {
  DefineVariable, VariablesActionTypes,
  VariableTypes,
  CREATE_VARIABLE, REMOVE_VARIABLE, UPDATE_VARIABLE_VALUE,
  CREATE_TRANSFORM, REMOVE_TRANSFORM, VariableKinds,
} from './types';
import { AppThunk } from '../types';
import { getScopeAndName } from './utils';

export function defineVariable(variable: DefineVariable): VariablesActionTypes {
  return {
    type: CREATE_VARIABLE,
    payload: { ...variable },
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

interface CreateVariableOptions{
  type: VariableKinds;
  format: string;
  description: string;
}
const createVariableOptionDefaults: CreateVariableOptions = {
  type: VariableKinds.number,
  format: '.1f',
  description: '',
};

export function createVariable(
  variableNameAndScope: string,
  value: VariableTypes,
  func: string = '',
  options?: Partial<CreateVariableOptions>,
): AppThunk<string> {
  return (dispatch) => {
    const { scope, name } = getScopeAndName(variableNameAndScope);
    const id = uuid();
    const { type, format, description } = {
      ...createVariableOptionDefaults,
      ...options,
    };
    dispatch(defineVariable({
      id, scope, name, value, func, description, type, format,
    }));
    return id;
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
