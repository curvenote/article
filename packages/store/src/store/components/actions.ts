import { v4 as uuid } from 'uuid';
import { forEachObject } from '../utils';
import {
  ComponentActionTypes,
  DEFINE_COMPONENT_SPEC,
  ComponentSpec,
  DEFINE_COMPONENT,
  NewComponent,
  DefineComponentProperty,
  ComponentEvent,
  COMPONENT_EVENT,
  REMOVE_COMPONENT,
  CreateComponentOptionDefaults,
  UpdateComponentOptionDefaults,
  DefineComponentPropertySpec,
  DefineComponentEventSpec,
  PartialProps,
} from './types';
import { AppThunk, State, Dispatch } from '../types';
import { getComponentSpec, getComponent, getComponentState } from './selectors';
import { getScopeAndName } from '../variables/utils';
import { VariableTypes } from '../variables/types';
import { getComponentSpecFromDefinition } from './utils';
import { ComponentShortcut, VariableShortcut } from '../shortcuts';


export function defineComponentSpec(componentSpec: ComponentSpec): ComponentActionTypes {
  return {
    type: DEFINE_COMPONENT_SPEC,
    payload: { ...componentSpec },
  };
}

export function defineComponent(component: NewComponent): ComponentActionTypes {
  return {
    type: DEFINE_COMPONENT,
    payload: { ...component },
  };
}

export function removeComponent(id: string): ComponentActionTypes {
  return {
    type: REMOVE_COMPONENT,
    payload: { id },
  };
}

function componentShortcut<T extends Record<string, VariableTypes>>(
  dispatch: Dispatch, getState: () => State, id: string,
): ComponentShortcut<T> {
  return {
    get id() { return id; },
    get scope() { return getComponent(getState(), id)?.scope; },
    get name() { return getComponent(getState(), id)?.name; },
    get component() { return getComponent(getState(), id) ?? undefined; },
    get state() { return getComponentState<T>(getState(), id); },
    set: (properties, events, options) => (
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      dispatch(updateComponent(id, properties, events, options)) as ComponentShortcut<T>
    ),
    setProperties: (properties) => (
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      dispatch(updateComponent(id, properties)) as ComponentShortcut<T>
    ),
    remove: () => dispatch(removeComponent(id)),
    dispatchEvent(name: string, values: VariableTypes[] = []) {
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      return dispatch(sendComponentEvent(id, name, values));
    },
  };
}

export function createComponentSpec(
  name: string,
  properties: Record<string, DefineComponentPropertySpec>,
  events: Record<string, DefineComponentEventSpec>,
  description: string = '',
): AppThunk<ComponentSpec> {
  return (dispatch, getState) => {
    if (getComponentSpec(getState(), name) != null) throw new Error('Component spec is already defined.');
    const spec = getComponentSpecFromDefinition({
      name, properties, events, description,
    });
    dispatch(defineComponentSpec(spec));
    return getComponentSpec(getState(), name) as ComponentSpec;
  };
}

const createComponentOptionDefaults = {
  description: '',
};

function processPropertiesAndEvents<T extends Record<string, VariableTypes>>(
  spec: ComponentSpec,
  scope: string,
  properties: {
    [P in keyof T]: PartialProps<T[P]> | VariableShortcut<T[P]>
  },
  events: Record<string, Omit<ComponentEvent, 'name'>>,
) {
  Object.keys(properties).forEach((propName) => {
    if (spec.properties[propName] == null) throw new Error(`Component prop ${propName} is not defined.`);
  });
  const props = forEachObject(
    spec.properties,
    ([propName, propSpec]): [string, DefineComponentProperty] => {
      const prop = (properties as any)[propName] as PartialProps | VariableShortcut | undefined;
      // If it is a variable schortcut:
      if (prop && 'variable' in prop) {
        return [propName, {
          name: propName,
          value: prop.get() ?? propSpec.default,
          // Note this will *not* change if the name of the variable changes:
          func: (scope === prop.scope ? prop.name : `${prop.scope}.${prop.name}`) ?? '',
        }];
      }
      // Specified a partial property {value?, func?}:
      return [propName, {
        name: propName,
        value: prop?.value ?? propSpec.default,
        func: prop?.func ?? '',
      }];
    },
  );
  const evts = forEachObject(events, ([evtName, evt]) => {
    const newEvt: ComponentEvent = {
      ...evt,
      name: evtName,
    };
    return [evtName, newEvt];
  });
  return { props, evts };
}


export function createComponent<T extends Record<string, VariableTypes>>(
  specName: string,
  componentNameAndScope: string,
  properties: {
    [P in keyof T]: PartialProps<T[P]> | VariableShortcut<T[P]>
  },
  events?: Record<string, Omit<ComponentEvent, 'name'>>,
  options?: CreateComponentOptionDefaults,
): AppThunk<ComponentShortcut<T>> {
  return (dispatch, getState) => {
    const spec = getComponentSpec(getState(), specName);
    if (spec == null) throw new Error('Component spec is not defined.');
    const id = uuid();
    const { scope, name } = getScopeAndName(componentNameAndScope);
    const { description } = {
      ...createComponentOptionDefaults,
      ...options,
    };
    const { props, evts } = processPropertiesAndEvents(spec, scope, properties, events ?? {});
    dispatch(defineComponent({
      spec: specName, scope, name, description, events: evts, properties: props, id,
    }));
    return componentShortcut(dispatch, getState, id);
  };
}

export function updateComponent<T extends Record<string, VariableTypes>>(
  id: string,
  properties: {
    [P in keyof T]: PartialProps<T[P]> | VariableShortcut<T[P]>
  },
  events?: Record<string, Omit<ComponentEvent, 'name'>>,
  options?: Partial<UpdateComponentOptionDefaults>,
): AppThunk<ComponentShortcut<T>> {
  return (dispatch, getState) => {
    const component = getComponent(getState(), id);
    const spec = getComponentSpec(getState(), component?.spec as string);
    if (component == null || spec == null) throw new Error('Component or ComponentSpec is not defined.');
    const { description, scope, name } = {
      ...component,
      ...options,
    };
    const { props, evts } = processPropertiesAndEvents(
      spec,
      scope,
      {
        ...component.properties,
        ...properties,
      },
      {
        ...component.events,
        ...events,
      },
    );
    dispatch(defineComponent({
      spec: component.spec, scope, name, description, events: evts, properties: props, id,
    }));
    return componentShortcut(dispatch, getState, id) as ComponentShortcut<T>;
  };
}

function componentEvent(
  id: string, component: string, name: string, values: VariableTypes[],
): ComponentActionTypes {
  return {
    type: COMPONENT_EVENT,
    payload: {
      id, component, name, values,
    },
  };
}

export function sendComponentEvent(
  componentId: string,
  name: string,
  values: VariableTypes[] = [],
): AppThunk {
  return (dispatch, getState) => {
    const component = getComponent(getState(), componentId);
    const spec = getComponentSpec(getState(), component!.spec);
    if (component == null || spec == null) throw new Error(`Component "${component?.spec}" is not defined`);
    if (spec.events[name] == null) throw new Error(`Event name "${name}" is not defined`);
    if (spec.events[name].args.length !== values.length) throw new Error(`Event values length (${values.length}) mismatch with spec: ${JSON.stringify(spec.events[name].args)}`);
    const id = uuid();
    dispatch(componentEvent(id, componentId, name, values));
  };
}
