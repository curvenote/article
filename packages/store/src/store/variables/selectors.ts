import {
  VariablesForExecution, ValueOrError, ScopedVariablesForExecution, ScopedVariables,
} from '../comms/types';
import { VariablesState, Variable } from './types';
import { State } from '../types';
import { getScopeAndName } from './utils';
import { Dictionary } from '../../utils';

export function mount(state: State): VariablesState {
  return state.variables;
}

export function getVariable(state: State, id: string): Variable | undefined {
  return mount(state).variables[id];
}

function lookupVariableByName(
  variables: Dictionary<Variable>, scope: string, name: string,
): Variable | undefined {
  const filtered = Object.entries(variables)
    .filter(([, variable]) => variable.scope === scope && variable.name === name);
  return filtered.length > 0 ? filtered[0][1] : undefined;
}

export function getVariableByName(state: State, scopeAndName: string): Variable | undefined {
  const { scope, name } = getScopeAndName(scopeAndName);
  return lookupVariableByName(mount(state).variables, scope, name);
}

export function getScopes(state: State): string[] {
  const scopes = new Set<string>();
  Object.entries(mount(state).variables)
    .forEach(([, variable]) => scopes.add(variable.scope));
  return [...scopes];
}

export function getVariablesInScope(state: State, scope: string): Variable[] {
  return Object.entries(mount(state).variables)
    .filter(([, variable]) => variable.scope === scope)
    .map(([, variable]) => variable);
}

function getScopedVariables(state: State, scope: string): VariablesForExecution {
  const variables = getVariablesInScope(state, scope);
  return {
    constants: Object.fromEntries(
      variables
        .filter((variable) => !variable.derived)
        .map((variable) => [variable.name, variable.current ?? variable.value]),
    ),
    derived: Object.fromEntries(
      variables
        .filter((variable) => variable.derived)
        .map((variable) => [variable.name, variable.func]),
    ),
    transforms: { ...mount(state).transforms },
  };
}

export function getVariables(state: State): ScopedVariablesForExecution {
  return Object.fromEntries(
    getScopes(state)
      .map((scope) => [scope, getScopedVariables(state, scope)]),
  );
}

function unpackCurrent<T>(state: T, current: ValueOrError): T {
  if (current == null) return { ...state };
  if (current.error) return { ...state, current: null, error: { ...current.error } };
  return { ...state, current: current.value ?? null, error: undefined };
}

export function setVariables(
  state: VariablesState, scopedVariables: ScopedVariables,
): VariablesState {
  const newState: VariablesState = {
    variables: { ...state.variables },
    transforms: { ...state.transforms },
  };
  Object.entries(scopedVariables).forEach(([scope, variableValues]) => {
    // Loop over constants, derived and transforms
    Object.entries(variableValues.constants).forEach(([name, value]) => {
      const { id } = lookupVariableByName(state.variables, scope, name) ?? {};
      if (id === undefined) return;
      const variable = newState.variables[id];
      newState.variables[id] = unpackCurrent(
        variable, value,
      );
    });

    Object.entries(variableValues.derived).forEach(([name, value]) => {
      const { id } = lookupVariableByName(state.variables, scope, name) ?? {};
      if (id === undefined) return;
      const variable = newState.variables[id];
      newState.variables[id] = unpackCurrent(
        variable, value,
      );
    });

    Object.entries(variableValues.transforms).forEach(([name, value]) => {
      const { id } = lookupVariableByName(state.variables, scope, name) ?? {};
      if (id === undefined) return;
      const transform = newState.transforms[id];
      newState.transforms[id] = unpackCurrent(transform, value);
    });
  });
  return newState;
}
