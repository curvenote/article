import { v4 as uuid } from 'uuid';
import {
  DefineVariable, VariablesActionTypes,
  VariableTypes,
  DEFINE_VARIABLE, REMOVE_VARIABLE,
  PropTypes,
  UpdateVariableOptions,
  CreateVariableOptions,
} from './types';
import {
  AppThunk, State, Dispatch, PartialProps,
} from '../types';
import { getScopeAndName } from './utils';
import { getVariable, getVariableState, getVariableAsComponent } from './selectors';
import { DEFAULT_FORMAT } from '../../constants';
import { VariableShortcut } from '../shortcuts';

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

const createVariableOptionDefaults = {
  description: '',
  type: PropTypes.number,
  format: DEFAULT_FORMAT,
};

function variableShortcut<T extends VariableTypes>(
  dispatch: Dispatch, getState: () => State, id: string,
): VariableShortcut<T> {
  return {
    get id() { return id; },
    get scope() { return getVariable(getState(), id)?.scope; },
    get name() { return getVariable(getState(), id)?.name; },
    get state() { return getVariableState<T>(getState(), id); },
    get component() { return getVariableAsComponent(getState(), id) ?? undefined; },
    get variable() { return getVariable(getState(), id) ?? undefined; },
    get: () => getVariable(getState(), id)?.current as T,
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    set: (value, func, options) => dispatch(updateVariable(id, value, func, options)),
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    setProperties: (properties) => dispatch(updateVariableProperties<T>(id, properties)),
    remove: () => dispatch(removeVariable(id)),
  };
}

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
      scope, name, value, func, description, type, format, id,
    }));
    return variableShortcut(dispatch, getState, id);
  };
}

export function updateVariable<T extends VariableTypes>(
  id: string,
  value: T,
  func: string = '',
  options?: Partial<UpdateVariableOptions>,
): AppThunk<VariableShortcut<T>> {
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
      scope, name, value, func, description, type, format, id,
    }));
    return variableShortcut(dispatch, getState, id);
  };
}


// This is to be consistent with the component setter
export function updateVariableProperties<T extends VariableTypes>(
  id: string,
  properties: Record<string, PartialProps | VariableShortcut>,
): AppThunk<VariableShortcut<T>> {
  return (dispatch, getState) => {
    const variable = getVariable(getState(), id);
    if (variable == null) throw new Error('Variable does not exist.');

    Object.entries(properties).forEach(([key, prop]) => {
      if ('variable' in prop) throw new Error(`Cannot use variable to set a variable: ${key}`);
    });

    const {
      scope: pScope,
      name: pName,
      value: pValue,
      description: pDescription,
      type: pType,
      format: pFormat,
    } = properties as Record<string, PartialProps>;

    const value = pValue?.value ?? variable.value;
    const func = pValue?.func ?? variable.func;
    const name = (pName?.value ?? variable.name) as string;
    const scope = (pScope?.value ?? variable.scope) as string;
    const description = (pDescription?.value ?? variable.description) as string;
    const type = (pType?.value ?? variable.type) as PropTypes;
    const format = (pFormat?.value ?? variable.format) as string;

    dispatch(defineVariable({
      scope, name, value, func, description, type, format, id,
    }));
    return variableShortcut(dispatch, getState, id);
  };
}
