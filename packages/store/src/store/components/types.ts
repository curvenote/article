import {
  VariableTypes, CurrentValue, PropTypes,
} from '../variables/types';
import { CommunicationActionTypes } from '../comms/types';

export const DEFINE_COMPONENT_SPEC = 'DEFINE_COMPONENT_SPEC';
export const DEFINE_COMPONENT = 'DEFINE_COMPONENT';
export const REMOVE_COMPONENT = 'REMOVE_COMPONENT';
export const COMPONENT_EVENT = 'COMPONENT_EVENT';

export interface ComponentPropertySpec {
  name: string;
  description?: string;
  type: PropTypes;
  default: VariableTypes;
  args: string[];
  has: {
    value: boolean;
    func: boolean;
  };
}

export interface ComponentEventSpec {
  name: string;
  args: string[];
}

// type, default are required, name not included, all other optional
export type DefineComponentPropertySpec = Partial<Omit<ComponentPropertySpec, 'name' | 'type' | 'default'>> &
Required<Pick<ComponentPropertySpec, 'type' | 'default'>>;
// name not included
export type DefineComponentEventSpec = Omit<ComponentEventSpec, 'name'>;

export interface ComponentSpec{
  name: string;
  description: string;
  properties: Record<string, ComponentPropertySpec>;
  events: Record<string, ComponentEventSpec>;
}

export interface DefineComponentProperty<T = VariableTypes> {
  name: string;
  value: T;
  func: string;
}

export type ComponentProperty = DefineComponentProperty & CurrentValue;

export interface ComponentEvent {
  name: string;
  func: string;
}

export interface Component {
  spec: string;
  id: string;
  scope: string;
  name: string;
  description: string;
  properties: Record<string, ComponentProperty>;
  events: Record<string, ComponentEvent>;
}
export type NewComponent = Omit<Component, 'properties'> & { properties: Record<string, DefineComponentProperty> };

export type ComponentsState = {
  specs: Record<string, ComponentSpec>;
  components: Record<string, Component>;
};

export interface ComponentEventAction {
  type: typeof COMPONENT_EVENT;
  payload: {
    id: string;
    component: string;
    name: string;
    values: VariableTypes[];
  };
}

export interface DefineComponentAction {
  type: typeof DEFINE_COMPONENT_SPEC;
  payload: ComponentSpec;
}

export interface CreateComponentAction {
  type: typeof DEFINE_COMPONENT;
  payload: NewComponent;
}

export interface RemoveComponentAction {
  type: typeof REMOVE_COMPONENT;
  payload: {id: string};
}

export type ComponentActionTypes = (
  DefineComponentAction |
  CreateComponentAction |
  RemoveComponentAction |
  ComponentEventAction |
  CommunicationActionTypes
);

export interface CreateComponentOptionDefaults{
  description: string;
}
export interface UpdateComponentOptionDefaults extends CreateComponentOptionDefaults {
  scope: string;
  name: string;
}

export type PartialProps<K = VariableTypes> = Partial<Omit<DefineComponentProperty<K>, 'name'>>;

export interface DefineComponentSpec{
  name: string;
  properties: Record<string, DefineComponentPropertySpec>;
  events: Record<string, DefineComponentEventSpec>;
  description?: string;
}
