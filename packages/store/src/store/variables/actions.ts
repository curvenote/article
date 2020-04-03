import { v4 as uuid } from 'uuid';
import { Transform } from '../comms/types';
import {
  DefineVariable, VariablesActionTypes,
  VariableTypes,
  DEFINE_VARIABLE, REMOVE_VARIABLE, UPDATE_VARIABLE_VALUE,
  CREATE_TRANSFORM, REMOVE_TRANSFORM, PropTypes,
} from './types';
import { AppThunk, State, Dispatch } from '../types';
import { getScopeAndName } from './utils';
import { getVariable } from './selectors';

export function defineVariable(variable: DefineVariable): VariablesActionTypes {
  return {
    type: DEFINE_VARIABLE,
    payload: { ...variable },
  };
}

export function removeVariable(id: string): VariablesActionTypes {
  return {
    type: REMOVE_VARIABLE,
    payload: { id },
  };
}

export interface CreateVariableOptions{
  description: string;
  type: PropTypes;
  format: string;
}
export interface UpdateVariableOptions extends CreateVariableOptions {
  scope: string;
  name: string;
}
const createVariableOptionDefaults: CreateVariableOptions = {
  description: '',
  type: PropTypes.number,
  format: '.1f',
};

const variableShortcut = (
  dispatch: Dispatch, getState: () => State, id: string,
) => ({
  id,
  get scope() { return getVariable(getState(), id)?.scope; },
  get name() { return getVariable(getState(), id)?.name; },
  get variable() { return getVariable(getState(), id) ?? undefined; },
  get: () => getVariable(getState(), id)?.current,
  set: (
    value: VariableTypes,
    func?: string,
    options?: Partial<UpdateVariableOptions>,
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  ) => dispatch(updateVariable(id, value, func, options)),
  remove: () => dispatch(removeVariable(id)),
});

export type VariableShortcut = ReturnType<typeof variableShortcut>;

export function createVariable(
  variableNameAndScope: string,
  value: VariableTypes,
  func: string = '',
  options?: Partial<CreateVariableOptions>,
): AppThunk<VariableShortcut> {
  return (dispatch, getState) => {
    const { scope, name } = getScopeAndName(variableNameAndScope);
    const id = uuid();
    const { description, type, format } = {
      ...createVariableOptionDefaults,
      ...options,
    };
    dispatch(defineVariable({
      id, scope, name, value, func, description, type, format,
    }));
    return variableShortcut(dispatch, getState, id);
  };
}

export function updateVariable(
  id: string,
  value: VariableTypes,
  func: string = '',
  options?: Partial<UpdateVariableOptions>,
): AppThunk<VariableShortcut> {
  return (dispatch, getState) => {
    const variable = getVariable(getState(), id);
    if (variable == null) throw new Error('Variable does not exist.');
    const {
      scope, name, description, type, format,
    } = {
      ...variable,
      ...options,
    };
    dispatch(defineVariable({
      id, scope, name, value, func, description, type, format,
    }));
    return variableShortcut(dispatch, getState, id);
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
