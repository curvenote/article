import { isEqual } from 'underscore';
import {
  VariableTypes, PropTypes, CurrentValue, Variable,
} from './types';
import { ValueOrError } from '../comms/types';
import { ComponentProperty } from '../components/types';

// eslint-disable-next-line import/prefer-default-export
export function convertValue(value: VariableTypes, type: PropTypes): VariableTypes {
  switch (type) {
    case PropTypes.number:
      return Number(value);
    case PropTypes.string:
      return value;
    default:
      return value;
  }
}


export function includeCurrentValue<T extends {
  value: VariableTypes;
  func: string;
}>(obj: T, type: PropTypes, current?: VariableTypes): T & CurrentValue {
  const derived = obj.func !== '';
  return {
    ...obj,
    derived,
    value: derived ? null : convertValue(obj.value, type),
    current: derived ? null : convertValue(current ?? obj.value, type),
  };
}

export function unpackCurrent<T>(state: T, current: ValueOrError): T {
  // TODO: Check the type of the return value.
  if (current == null) return { ...state };
  if (current.error) return { ...state, current: null, error: { ...current.error } };
  return { ...state, current: current.value ?? null, error: undefined };
}

export function getScopeAndName(
  scopeAndName: string, defaultScope: string = 'global',
): {scope: string, name: string} {
  const split = scopeAndName.split('.');
  if (split.length === 1) {
    return { scope: defaultScope, name: split[0] };
  }
  if (split.length !== 2) throw new Error('name is malformed');
  return { scope: split[0], name: split[1] };
}

export function testScopeAndName(scope: string, name: string): boolean {
  // Simple variable names only ....
  const regex = /^[a-zA-Z_$][0-9a-zA-Z_$]*$/;
  return regex.test(scope) && regex.test(name);
}

export function compareDefine(
  prev: Variable | ComponentProperty,
  next: Variable | ComponentProperty,
) {
  const one = { ...prev };
  const two = { ...next };
  delete one.current;
  delete two.current;
  delete one.error;
  delete two.error;
  return isEqual(one, two);
}

export function compareEval(prev: CurrentValue, next: CurrentValue) {
  const one = { value: prev.current, error: prev.error };
  const two = { value: next.current, error: next.error };
  return isEqual(one, two);
}
