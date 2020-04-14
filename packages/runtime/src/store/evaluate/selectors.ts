import { State } from '../types';
import { getComponentState } from '../components/selectors';
import { ExecutionState } from './types';

// eslint-disable-next-line import/prefer-default-export
export function getExecutionState(
  state: State,
): ExecutionState {
  const executionState: ExecutionState = {};
  // Get the variables (derived and constants)
  Object.entries(state.ink.variables).forEach(([, { scope, name, current }]) => {
    executionState[scope] = {
      ...executionState[scope],
      [name]: current,
    };
  });
  // Get the *named* components
  Object.entries(state.ink.components.components).forEach(([id, { scope, name }]) => {
    if (!name) return;
    executionState[scope] = {
      ...executionState[scope],
      [name]: getComponentState(state, id),
    };
  });
  return executionState;
}
