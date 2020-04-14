import { v4 as uuid } from 'uuid';
import { DEFINE_VARIABLE, REMOVE_VARIABLE } from './variables/types';
import { evaluate } from './comms/actions';
import { Middleware } from './types';
import { DEFINE_COMPONENT_SPEC, DEFINE_COMPONENT, REMOVE_COMPONENT } from './components/types';

const triggerEvaluate: Middleware = (
  (store) => (next) => (action) => {
    const result = next(action);
    switch (action.type) {
      case DEFINE_VARIABLE:
      case REMOVE_VARIABLE:
      case DEFINE_COMPONENT_SPEC:
      case DEFINE_COMPONENT:
      case REMOVE_COMPONENT: {
        const id = uuid();
        store.dispatch(evaluate(id));
        break;
      }
      default:
        break;
    }
    return result;
  }
);

export default triggerEvaluate;
