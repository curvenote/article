import {
  Component, PartialProps, ComponentEvent, UpdateComponentOptionDefaults,
} from './components/types';
import { VariableTypes, UpdateVariableOptions, Variable } from './variables/types';

export interface Shortcut<T> {
  readonly id: string;
  readonly scope: string | undefined;
  readonly name: string | undefined;
  readonly state: T;
  readonly component: Component | undefined;
  remove: () => void;
  setProperties: (
    properties: Record<string, PartialProps | VariableShortcut<any>>,
  ) => Shortcut<T>
}

export interface VariableShortcut<V extends VariableTypes = VariableTypes>
  extends Shortcut<Variable & { value: V }> {
  readonly variable: Variable | undefined;
  get: () => V | undefined;
  set: (
    value: V,
    func?: string | undefined,
    options?: Partial<UpdateVariableOptions>,
  ) => VariableShortcut<V>;
}

export interface ComponentShortcut<T> extends Shortcut<T> {
  readonly component: Component | undefined;
  set: (
    properties: Record<string, PartialProps | VariableShortcut<any>>,
    events?: Record<string, Omit<ComponentEvent, 'name'>>,
    options?: Partial<UpdateComponentOptionDefaults>,
  ) => ComponentShortcut<T>,
  dispatchEvent(name: string, values?: VariableTypes[]): void;
}
