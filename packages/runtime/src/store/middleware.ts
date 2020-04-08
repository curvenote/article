import { v4 as uuid } from 'uuid';
import { DEFINE_VARIABLE, REMOVE_VARIABLE } from './variables/types';
import { evaluateVariables } from './comms/actions';
import { Middleware } from './types';
import { DEFINE_COMPONENT_SPEC, DEFINE_COMPONENT } from './components/types';

const triggerEvaluateMiddleware: Middleware = (
  (store) => (next) => (action) => {
    const result = next(action);
    switch (action.type) {
      case DEFINE_VARIABLE:
      case REMOVE_VARIABLE:
      case DEFINE_COMPONENT_SPEC:
      case DEFINE_COMPONENT: {
        const id = uuid();
        store.dispatch(evaluateVariables(id));
        break;
      }
      default:
        break;
    }
    return result;
  }
);

export default triggerEvaluateMiddleware;
