import { CommunicationActionTypes, EvaluationError } from '../comms/types';

export const DEFINE_VARIABLE = 'DEFINE_VARIABLE';
export const UPDATE_VARIABLE_VALUE = 'UPDATE_VARIABLE_VALUE';
export const REMOVE_VARIABLE = 'REMOVE_VARIABLE';

export enum PropTypes{
  string = 'String',
  number = 'Number',
}

export type VariableTypes = string | number | null;

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

export interface UpdateVariableValue {
  type: typeof UPDATE_VARIABLE_VALUE;
  payload: {
    id: string;
    value: VariableTypes;
  }
}

export interface RemoveVariable {
  type: typeof REMOVE_VARIABLE;
  payload: {
    id: string;
  }
}

export type VariablesActionTypes = (
  CreateVariable |
  UpdateVariableValue |
  RemoveVariable |
  CommunicationActionTypes
);
