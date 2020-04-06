import {
  ValueOrError,
  EvaluationErrorTypes,
  Results,
} from '../comms/types';
import { Dictionary } from '../../utils';
import { getExecutionState } from './selectors';
import { AppThunk, State } from '../types';
import { VariableTypes } from '../variables/types';
import { ExecutionState } from './types';
import { getScopeAndName } from '../variables/utils';
import { getVariableByName } from '../variables/selectors';
import serialize from './serialize';

export function evaluateVariable(
  scopeName: string,
  funcString: string,
  executionState: Dictionary<Dictionary<any>>,
  argNames: string[] = [],
  argValues: VariableTypes[] = [],
): ValueOrError {
  const currentKeys = Object.keys(executionState[scopeName]);
  let derived;
  try {
    const extractScope = currentKeys.length > 0
      ? `
      const { ${currentKeys.join(', ')} } = $variables[$scope];`
      : '';

    const evalString = `
      "use strict";${extractScope}
      return function (${argNames.join(', ')}){
        "use strict";
        return ( ${funcString} );
      };
    `;
    // eslint-disable-next-line no-new-func
    const func = Function('$variables', '$scope', evalString);
    // TODO: could potentially clone the executionState?
    derived = func(executionState, scopeName)(...argValues);
  } catch (error) {
    return {
      error: { message: error, type: EvaluationErrorTypes.evaluation },
    };
  }
  if (derived === undefined) {
    return { value: undefined };
  }
  try {
    return { value: serialize(derived) };
  } catch (error) {
    return {
      error: { message: error, type: EvaluationErrorTypes.serialize },
    };
  }
}

export interface Event {
  id: string;
  name: string;
  values: VariableTypes[];
}

function evaluateEvent(state: State, event: Event, executionState: ExecutionState) {
  const { id, name, values } = event;

  const component = state.components.components[id];
  const spec = state.components.specs[component.spec].events[name];
  const eventFunc = component.events[name].func;

  return {
    scope: component.scope,
    result: evaluateVariable(component.scope, eventFunc, executionState, spec.args, values),
  };
}


export function evaluate(event?: Event): AppThunk<Results> {
  return (dispatch, getState) => {
    // These are the variables that will be returned
    const results: Results = {
      variables: {},
      components: {},
      event: {},
    };

    // Get the scopes with current values
    const executionState = getExecutionState(getState());

    // Process any events
    if (event !== undefined) {
      (() => {
        const { result, scope } = evaluateEvent(getState(), event, executionState);
        results.event = result;
        if (result.error) return;
        if (typeof result.value === 'object') {
          Object.entries(result.value as Dictionary<any>).forEach(([key, value]) => {
            const { scope: toScope, name } = getScopeAndName(key, scope);
            const variable = getVariableByName(getState(), `${toScope}.${name}`);
            // TODO: raise error or something here as the event is not working
            if (variable == null || variable.derived) return;
            results.variables[variable.id] = { value };
            executionState[toScope][name] = value;
          });
        }
      })();
    }

    // Append the derived variables
    Object.entries(getState().variables)
      .filter(([, variable]) => variable.derived)
      .forEach(([id, variable]) => {
        const { scope, name } = variable;
        // You can't self reference
        delete executionState[scope][name];
        const result = evaluateVariable(scope, variable.func, executionState);
        results.variables[id] = result;
        if (result.error) return;
        executionState[scope][name] = result.value;
      });

    // Evaluate the components
    Object.entries(getState().components.components)
      .forEach(([id, component]) => {
        const { scope, name } = component;
        results.components[id] = {};
        Object.entries(component.properties)
          // only the derived properties
          .filter(([, prop]) => prop.derived)
          .forEach(([propName, prop]) => {
            const result = evaluateVariable(scope, prop.func, executionState);
            results.components[id][propName] = result;
            if (result.error) return;
            if (name) {
              executionState[scope][name][propName] = result.value;
            }
          });
      });

    return results;
  };
}
