import {
  VariablesForExecution, ValueOrError, Variables, ScopedVariablesForExecution, Dictionary,
} from './store/comms/types';
import { VariablesState, ScopedVariableState } from './store/variables/types';

function getScopedVariables(state: ScopedVariableState): VariablesForExecution {
  return {
    constants: Object.fromEntries(
      Object.entries(state.variables)
        .filter(([, variable]) => !variable.derived)
        .map(([key, variable]) => [key, variable.current ?? variable.value]),
    ),
    derived: Object.fromEntries(
      Object.entries(state.variables)
        .filter(([, variable]) => variable.derived)
        .map(([key, variable]) => [key, variable.func]),
    ),
    transforms: { ...state.transforms },
  };
}

export function getVariables(state: VariablesState): ScopedVariablesForExecution {
  return Object.fromEntries(
    Object.entries(state.scopes)
      .map(([name, scope]) => [name, getScopedVariables(scope)]),
  );
}

function unpackCurrent<T>(state: T, current: ValueOrError): T {
  if (current == null) return { ...state };
  if (current.error) return { ...state, current: null, error: { ...current.error } };
  return { ...state, current: current.value ?? null, error: undefined };
}

function setScopedVariables(
  state: ScopedVariableState, values: Variables,
): ScopedVariableState {
  const newState: ScopedVariableState = { ...state, variables: { ...state.variables } };
  Object.entries(state.variables).forEach(([name, variable]) => {
    newState.variables[name] = unpackCurrent(
      variable,
      variable.derived ? values.derived[name] : values.constants[name],
    );
  });

  Object.entries(state.transforms).forEach(([name, transform]) => {
    newState.transforms[name] = unpackCurrent(transform, values.transforms[name]);
  });
  return newState;
}

export function setVariables(
  state: VariablesState, variables: Dictionary<Variables>,
):VariablesState {
  const newVars = { ...state };
  Object.entries(variables).forEach(([name, scope]) => {
    const scoped = newVars.scopes[name];
    if (scoped === undefined) {
      // console.log('Scope variables do not exist.');
      return;
    }
    newVars.scopes[name] = setScopedVariables(scoped, scope);
  });
  return newVars;
}
