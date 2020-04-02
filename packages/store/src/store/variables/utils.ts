import { VariableTypes, VariableKinds } from './types';

// eslint-disable-next-line import/prefer-default-export
export function convertValue(value: VariableTypes, type: VariableKinds): VariableTypes {
  switch (type) {
    case VariableKinds.number:
      return Number(value);
    case VariableKinds.string:
      return value;
    default:
      return value;
  }
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
