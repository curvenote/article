import { EVALUATE_VARIABLES } from '../comms/types';
import { returnVariables } from '../comms/actions';
import { Middleware } from '../types';
import { evaluate } from './evaluate';

const evaluateMiddleware: Middleware = (
  (store) => (next) => (action) => {
    const result = next(action);
    switch (action.type) {
      case EVALUATE_VARIABLES: {
        const { id, variables } = action.payload;
        const evaluated = evaluate(variables);
        store.dispatch(returnVariables(id, evaluated));
        break;
      }
      default:
        break;
    }
    return result;
  }
);

export default evaluateMiddleware;
