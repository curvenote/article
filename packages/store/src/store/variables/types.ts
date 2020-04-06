import { CommunicationActionTypes, EvaluationError } from '../comms/types';

export const DEFINE_VARIABLE = 'DEFINE_VARIABLE';
export const REMOVE_VARIABLE = 'REMOVE_VARIABLE';

export enum PropTypes{
  string = 'String',
  number = 'Number',
  boolean = 'Boolean',
}

export type VariableTypes = string | number | boolean | null;

export interface DefineVariable{
  id: string;
  type: PropTypes;
  scope: string;
  name: string;
  description: string;
  format: string;
  value: VariableTypes;
  func: string;
}

export interface CurrentValue {
  derived: boolean;
  current: VariableTypes;
  error?: EvaluationError;
}

export type Variable = DefineVariable & CurrentValue;

export type VariablesState = {
  [index: string]: Variable;
};

export interface CreateVariable {
  type: typeof DEFINE_VARIABLE;
  payload: DefineVariable;
}

export interface RemoveVariable {
  type: typeof REMOVE_VARIABLE;
  payload: {
    id: string;
  }
}

export type VariablesActionTypes = (
  CreateVariable |
  RemoveVariable |
  CommunicationActionTypes
);

// For the actions
export type CreateVariableOptions = {
  description: string;
  type: PropTypes;
  format: string;
};
export interface UpdateVariableOptions extends CreateVariableOptions {
  scope: string;
  name: string;
}
export type VariableShortcut<T = VariableTypes> = {
  readonly id: string;
  readonly scope: string | undefined;
  readonly name: string | undefined;
  readonly variable: Variable | undefined;
  get: () => T | undefined;
  set: (
    value: T,
    func?: string | undefined,
    options?: Partial<UpdateVariableOptions>,
  ) => VariableShortcut;
  remove: () => VariablesActionTypes;
};
