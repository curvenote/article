import { Dictionary } from '../../utils';
import {
  VariableTypes, CurrentValue, PropTypes, VariableShortcut,
} from '../variables/types';
import { CommunicationActionTypes } from '../comms/types';

export const DEFINE_COMPONENT_SPEC = 'DEFINE_COMPONENT_SPEC';
export const DEFINE_COMPONENT = 'DEFINE_COMPONENT';
export const REMOVE_COMPONENT = 'REMOVE_COMPONENT';
export const COMPONENT_EVENT = 'COMPONENT_EVENT';

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

export type PartialProps = Partial<Omit<DefineComponentProperty, 'name'>>;

export type ComponentShortcut<T extends string | number | symbol> = {
  readonly id: string;
  readonly scope: string | undefined;
  readonly name: string | undefined;
  readonly component: Component | undefined;
  readonly state: Record<T, VariableTypes> | undefined;
  set: (
    properties: Dictionary<PartialProps | VariableShortcut>,
    events?: Dictionary<Omit<ComponentEvent, 'name'>>,
    options?: UpdateComponentOptionDefaults,
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
  ) => ComponentShortcut<T>,
  remove: () => ComponentActionTypes;
  dispatchEvent(name: string, values: VariableTypes[]): void;
};
