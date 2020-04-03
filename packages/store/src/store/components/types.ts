import { Dictionary } from '../../utils';
import { VariableTypes, CurrentValue, PropTypes } from '../variables/types';

export const DEFINE_COMPONENT_SPEC = 'DEFINE_COMPONENT_SPEC';
export const DEFINE_COMPONENT = 'DEFINE_COMPONENT';

export interface ComponentPropertySpec {
  name: string;
  type: PropTypes;
  default: VariableTypes;
  funcOnly: boolean;
  args: string[];
}

export interface ComponentEventSpec {
  name: string;
  args: string[];
}

export interface ComponentSpec{
  name: string;
  description: string;
  properties: Dictionary<ComponentPropertySpec>;
  events: Dictionary<ComponentEventSpec>;
}

export interface DefineComponentProperty {
  name: string;
  value: VariableTypes;
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
  properties: Dictionary<ComponentProperty>;
  events: Dictionary<ComponentEvent>;
}
export type NewComponent = Omit<Component, 'properties'> & { properties: Dictionary<DefineComponentProperty> };

export type ComponentsState = {
  specs: Dictionary<ComponentSpec>;
  components: Dictionary<Component>;
};

export interface DefineComponent {
  type: typeof DEFINE_COMPONENT_SPEC;
  payload: ComponentSpec;
}

export interface CreateComponent {
  type: typeof DEFINE_COMPONENT;
  payload: NewComponent;
}

export type ComponentActionTypes = (
  DefineComponent |
  CreateComponent
);
