import { Variable, VariableTypes } from './types';
import { State } from '../types';
import { getScopeAndName } from './utils';
import { Component } from '../components/types';

export function getVariable(state: State, id: string): Variable | undefined {
  return state.variables[id];
}

export function getVariableAsComponent(state: State, id: string): Component | undefined {
  const variable = state.variables[id];
  if (variable == null) return undefined;
  return {
    id: variable.id,
    spec: 'var',
    scope: variable.scope,
    name: variable.name,
    description: variable.description,
    properties: {
      value: {
        name: 'value', value: variable.value, func: variable.func, current: variable.current, derived: variable.derived,
      },
      name: {
        name: 'name', value: variable.name, func: '', current: variable.name, derived: false,
      },
      format: {
        name: 'format', value: variable.format, func: '', current: variable.format, derived: false,
      },
      description: {
        name: 'description', value: variable.description, func: '', current: variable.description, derived: false,
      },
      type: {
        name: 'type', value: variable.type, func: '', current: variable.type, derived: false,
      },
    },
    events: {},
  };
}

export function getVariableByName(state: State, scopeAndName: string): Variable | undefined {
  const { scope, name } = getScopeAndName(scopeAndName);
  const filtered = Object.entries(state.variables)
    .filter(([, variable]) => variable.scope === scope && variable.name === name);
  return filtered.length > 0 ? filtered[0][1] : undefined;
}

export function getVariableState<V extends VariableTypes>(
  state: State, id: string,
): Variable & { value: V } {
  const variable = getVariable(state, id);
  if (variable == null) return {} as Variable & { value: V };
  return variable as Variable & { value: V };
}
