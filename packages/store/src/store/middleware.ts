import { v4 as uuid } from 'uuid';
import {
  UPDATE_VARIABLE_VALUE, DEFINE_VARIABLE, REMOVE_VARIABLE,
  CREATE_TRANSFORM, REMOVE_TRANSFORM,
} from './variables/types';
import { evaluateVariables } from './comms/actions';
import { getVariables } from './variables/selectors';
import { Middleware } from './types';

const triggerEvaluateMiddleware: Middleware = (
  (store) => (next) => (action) => {
    const result = next(action);
    switch (action.type) {
      case DEFINE_VARIABLE:
      case REMOVE_VARIABLE:
      case UPDATE_VARIABLE_VALUE:
      case CREATE_TRANSFORM:
      case REMOVE_TRANSFORM: {
        const id = uuid();
        const variables = getVariables(store.getState());
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
