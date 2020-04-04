import { Variable } from './types';
import { State } from '../types';
import { getScopeAndName } from './utils';

export function getVariable(state: State, id: string): Variable | undefined {
  return state.variables[id];
}

export function getVariableByName(state: State, scopeAndName: string): Variable | undefined {
  const { scope, name } = getScopeAndName(scopeAndName);
  const filtered = Object.entries(state.variables)
    .filter(([, variable]) => variable.scope === scope && variable.name === name);
  return filtered.length > 0 ? filtered[0][1] : undefined;
}
