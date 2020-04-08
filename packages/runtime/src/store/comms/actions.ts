import {
  CommunicationActionTypes,
  EVALUATE, RETURN_RESULTS,
  Results,
} from './types';

export function evaluateVariables(id: string): CommunicationActionTypes {
  return {
    type: EVALUATE,
    payload: { id },
  };
}

export function returnResults(
  id: string, results: Results,
): CommunicationActionTypes {
  return {
    type: RETURN_RESULTS,
    payload: { id, results },
  };
}
