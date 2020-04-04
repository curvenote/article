import { EVALUATE } from '../comms/types';
import { returnResults } from '../comms/actions';
import { Middleware } from '../types';
import { evaluate } from './evaluate';
import { COMPONENT_EVENT, ComponentEventAction } from '../components/types';

const evaluateMiddleware: Middleware = (
  (store) => (next) => (action) => {
    const result = next(action);
    switch (action.type) {
      case EVALUATE: {
        const { id } = action.payload;
        const evaluated = store.dispatch(evaluate());
        store.dispatch(returnResults(id, evaluated));
        break;
      }
      case COMPONENT_EVENT: {
        const {
          id, component, name, values,
        } = (action as ComponentEventAction).payload;
        const evaluated = store.dispatch(evaluate({
          id: component,
          name,
          values,
        }));
        store.dispatch(returnResults(id, evaluated));
        break;
      }
      default:
        break;
    }
    return result;
  }
);

export default evaluateMiddleware;
