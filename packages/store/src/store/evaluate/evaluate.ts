import {
  ScopedVariables,
  Dictionary,
  VariablesForExecution,
  ValueOrError,
  Args,
  EvaluationErrorTypes,
} from '../comms/types';

export function getScopedVariables(scoped: Dictionary<VariablesForExecution>): ScopedVariables {
  // Create the action to send back
  const variables: ScopedVariables = Object.fromEntries(
    Object.entries(scoped).map(([name, scope]) => [
      name,
      {
        constants: Object.fromEntries(
          Object.entries(scope.constants)
            .map(([key, value]) => [key, { value }]),
        ),
        derived: {},
        transforms: {},
      },
    ]),
  );
  return variables;
}

export function getExecutionVariables(
  scoped: Dictionary<VariablesForExecution>,
): Dictionary<Dictionary<any>> {
  // Get the static variables.
  const variablesForExecution = Object.fromEntries(
    Object.entries(scoped).map(([name, scope]) => [
      name,
      { ...scope.constants },
    ]),
  );
  return variablesForExecution;
}

export function evaluateVariable(
  scopeName: string,
  funcString: string,
  executionVariables: Dictionary<Dictionary<any>>,
  args: Args,
): ValueOrError {
  const currentKeys = Object.keys(executionVariables[scopeName]);
  const argNames = args.map((arg) => arg.name);
  const argValues = args.map((arg) => {
    const split = arg.value.split('.');
    if (split.length > 1) {
      return executionVariables[split[0]][split[1]];
    }
    return executionVariables[scopeName][split[0]];
  });
  let derived;
  try {
    const evalString = `
      "use strict";
      const { ${currentKeys.join(', ')} } = $variables[$scope];
      return function (${argNames.join(', ')}){
        "use strict";
        return ( ${funcString} );
      };
    `;
    // eslint-disable-next-line no-new-func
    const func = Function('$variables', '$scope', evalString);
    // TODO: could potentially clone the executionVariables?
    derived = func(executionVariables, scopeName)(...argValues);
  } catch (error) {
    return {
      error: { message: error, type: EvaluationErrorTypes.evaluation },
    };
  }
  if (derived === undefined) {
    return { value: undefined };
  }
  try {
    return {
      // TODO: this should be better.
      // e.g. arrays?
      value: JSON.parse(JSON.stringify(derived)),
    };
  } catch (error) {
    return {
      error: { message: error, type: EvaluationErrorTypes.serialize },
    };
  }
}


export function evaluate(scoped: Dictionary<VariablesForExecution>): ScopedVariables {
  const variables = getScopedVariables(scoped);
  const executionVariables = getExecutionVariables(scoped);

  Object.entries(scoped).forEach(([scopeName, scope]) => {
    // Append the derived variables.
    Object.entries(scope.derived)
      .forEach(([name, valueFunction]) => {
        const result = evaluateVariable(scopeName, valueFunction, executionVariables, []);
        variables[scopeName].derived[name] = result;
        if (result.error) return;
        executionVariables[scopeName][name] = result.value;
      });

    // Append the derived variables.
    Object.entries(scope.transforms)
      .forEach(([name, { func, args }]) => {
        const result = evaluateVariable(scopeName, func, executionVariables, args);
        variables[scopeName].transforms[name] = result;
      });
  });

  return variables;
}
