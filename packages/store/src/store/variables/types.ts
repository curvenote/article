import { CommunicationActionTypes, EvaluationError, Transform } from '../comms/types';

export const DEFINE_VARIABLE = 'DEFINE_VARIABLE';
export const UPDATE_VARIABLE_VALUE = 'UPDATE_VARIABLE_VALUE';
export const REMOVE_VARIABLE = 'REMOVE_VARIABLE';
export const CREATE_TRANSFORM = 'CREATE_TRANSFORM';
export const REMOVE_TRANSFORM = 'REMOVE_TRANSFORM';

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

export interface CurrentTransform extends Transform{
  current: VariableTypes;
  error?: EvaluationError;
}

export type VariablesState = {
  variables: {
    [index: string]: Variable;
  }
  transforms: {
    [index: string]: CurrentTransform;
  }
};

export interface CreateVariable {
  type: typeof DEFINE_VARIABLE;
  payload: DefineVariable;
}

export interface UpdateVariableValue {
  type: typeof UPDATE_VARIABLE_VALUE;
  payload: {
    scope: string;
    name: string;
    value: VariableTypes;
  }
}

export interface RemoveVariable {
  type: typeof REMOVE_VARIABLE;
  payload: {
    id: string;
  }
}


export interface CreateTransform {
  type: typeof CREATE_TRANSFORM;
  payload: {
    scope: string;
    transform: Transform;
    previous: string;
  }
}

export interface RemoveTransform {
  type: typeof REMOVE_TRANSFORM;
  payload: {
    scope: string;
    id?: string;
    ids?: string[];
  }
}

export type VariablesActionTypes = (
  CreateVariable |
  UpdateVariableValue |
  RemoveVariable |
  CreateTransform |
  RemoveTransform |
  CommunicationActionTypes
);
