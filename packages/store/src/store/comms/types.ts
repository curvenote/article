export const EVALUATE_VARIABLES = 'EVALUATE_VARIABLES';
export const RETURN_VARIABLES = 'RETURN_VARIABLES';

export type Dictionary<T> = { [index: string]: T };

export type Args = { name: string, value: string }[];

export type Transform = {
  id: string;
  func: string;
  args: Args;
};

export type VariablesForExecution = {
  constants: Dictionary<any>;
  derived: Dictionary<string>;
  transforms: Dictionary<Transform>;
};


export type ScopedVariablesForExecution = Dictionary<VariablesForExecution>;

export enum EvaluationErrorTypes {
  evaluation,
  serialize,
  scope,
}

export type EvaluationError = {
  message: string;
  type: EvaluationErrorTypes;
};

export type ValueOrError = { value?: any, error?: EvaluationError };

export type Variables = {
  constants: Dictionary<ValueOrError>;
  transforms: Dictionary<ValueOrError>;
  derived: Dictionary<ValueOrError>;
};

export type ScopedVariables = Dictionary<Variables>;

export interface EvaluateVariables {
  type: typeof EVALUATE_VARIABLES;
  payload: {
    id: string;
    variables: ScopedVariablesForExecution;
  }
}

export interface ReturnVariables {
  type: typeof RETURN_VARIABLES;
  payload: {
    id: string;
    variables: ScopedVariables;
  }
}

export type CommunicationActionTypes = (
  EvaluateVariables |
  ReturnVariables
);
