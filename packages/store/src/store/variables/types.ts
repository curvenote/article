import { CommunicationActionTypes, EvaluationError, Transform } from '../comms/types';

export const CREATE_VARIABLE = 'CREATE_VARIABLE';
export const UPDATE_VARIABLE_VALUE = 'UPDATE_VARIABLE_VALUE';
export const REMOVE_VARIABLE = 'REMOVE_VARIABLE';
export const CREATE_TRANSFORM = 'CREATE_TRANSFORM';
export const REMOVE_TRANSFORM = 'REMOVE_TRANSFORM';

export enum VariableKinds{
  string = 'String',
  number = 'Number',
}

export type VariableTypes = string | number | null;

export interface DefineVariable{
  name: string;
  type: VariableKinds;
  value: VariableTypes;
  format: string;
  description: string;
  valueFunction: string;
}

export interface Variable extends DefineVariable{
  derived: boolean;
  current: VariableTypes;
  error?: EvaluationError;
}

export interface CurrentTransform extends Transform{
  current: VariableTypes;
  error?: EvaluationError;
}

export type ScopedVariableState = {
  transforms: {
    [index: string]: CurrentTransform;
  }
  variables: {
    [index: string]: Variable;
  }
};

export type VariablesState = {
  scopes: {
    [index: string]: ScopedVariableState;
  }
};

export interface CreateVariable {
  type: typeof CREATE_VARIABLE;
  payload: {
    scope: string;
    variable: DefineVariable;
    previous: string;
  }
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
    scope: string;
    name: string;
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
