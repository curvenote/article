import {
  CommunicationActionTypes,
  EVALUATE_VARIABLES, RETURN_VARIABLES,
  ScopedVariablesForExecution, ScopedVariables,
} from './types';

export function evaluateVariables(
  id: string, variables: ScopedVariablesForExecution,
): CommunicationActionTypes {
  return {
    type: EVALUATE_VARIABLES,
    payload: {
      id,
      variables,
    },
  };
}

export function returnVariables(
  id: string, variables: ScopedVariables,
): CommunicationActionTypes {
  return {
    type: RETURN_VARIABLES,
    payload: {
      id,
      variables,
    },
  };
}
