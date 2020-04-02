import { v4 as uuid } from 'uuid';
import {
  UPDATE_VARIABLE_VALUE, CREATE_VARIABLE, REMOVE_VARIABLE,
  CREATE_TRANSFORM, REMOVE_TRANSFORM,
} from './types';
import { evaluateVariables } from '../comms/actions';
import { getVariables } from '../../utils';
import { Middleware } from '../types';

const triggerEvaluateMiddleware: Middleware = (
  (store) => (next) => (action) => {
    const result = next(action);
    switch (action.type) {
      case CREATE_VARIABLE:
      case REMOVE_VARIABLE:
      case UPDATE_VARIABLE_VALUE:
      case CREATE_TRANSFORM:
      case REMOVE_TRANSFORM: {
        const id = uuid();
        const variables = getVariables(store.getState().variables);
        store.dispatch(evaluateVariables(id, variables));
        break;
      }
      default:
        break;
    }
    return result;
  }
);

export default triggerEvaluateMiddleware;
