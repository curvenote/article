import { v4 as uuid } from 'uuid';
import { Dictionary, forEachObject } from '../../utils';
import {
  ComponentActionTypes,
  DEFINE_COMPONENT_SPEC,
  ComponentSpec,
  DEFINE_COMPONENT,
  NewComponent,
  ComponentPropertySpec,
  ComponentEventSpec,
  DefineComponentProperty,
  ComponentEvent,
} from './types';
import { AppThunk, State, Dispatch } from '../types';
import { getComponentSpec, getComponent, getComponentState } from './selectors';
import { getScopeAndName } from '../variables/utils';
import { VariableTypes } from '../variables/types';


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

function componentShortcut<T extends string | number | symbol>(
  dispatch: Dispatch, getState: () => State, id: string,
) {
  return {
    id,
    get scope() { return getComponent(getState(), id)?.scope; },
    get name() { return getComponent(getState(), id)?.name; },
    get component() { return getComponent(getState(), id) ?? undefined; },
    get state() { return getComponentState<T>(getState(), id); },
    // set: (
    //   value: VariableTypes,
    //   func?: string,
    //   options?: Partial<UpdateVariableOptions>,
    //   // eslint-disable-next-line @typescript-eslint/no-use-before-define
    // ) => dispatch(updateVariable(id, value, func, options)),
    // remove: () => dispatch(removeVariable(id)),
  };
}

export type ComponentShortcut<T extends string | number | symbol> = (
  ReturnType<typeof componentShortcut> &
  {state: Record<T, VariableTypes>}
);

export function createComponentSpec(
  name: string,
  properties: Dictionary<
  Partial<Omit<ComponentPropertySpec, 'name' | 'type' | 'default'>> &
  Required<Pick<ComponentPropertySpec, 'type' | 'default'>>
  >,
  events: Dictionary<Omit<ComponentEventSpec, 'name'>>,
  description: string = '',
): AppThunk<ComponentSpec> {
  return (dispatch, getState) => {
    const spec = getComponentSpec(getState(), name);
    if (spec != null) throw new Error('Component spec is already defined.');
    const props = forEachObject(properties, ([propName, prop]) => {
      const newProp: ComponentPropertySpec = {
        ...prop,
        name: propName,
        args: prop.args ?? [],
        funcOnly: prop.funcOnly ?? false,
      };
      return [propName, newProp];
    });
    const evts = forEachObject(events, ([evtName, evt]) => {
      const newEvt: ComponentEventSpec = {
        ...evt,
        name: evtName,
      };
      return [evtName, newEvt];
    });
    dispatch(defineComponentSpec({
      name, description, properties: props, events: evts,
    }));
    return getComponentSpec(getState(), name) as ComponentSpec;
  };
}

const createComponentOptionDefaults = {
  description: '',
};

type PartialProps = Partial<Omit<DefineComponentProperty, 'name'>>;
export function createComponent<T extends string | number | symbol>(
  specName: string,
  componentNameAndScope: string,
  properties: Record<T, PartialProps>,
  events: Dictionary<Omit<ComponentEvent, 'name'>>,
  options?: typeof createComponentOptionDefaults,
): AppThunk<ComponentShortcut<keyof typeof properties>> {
  return (dispatch, getState) => {
    const spec = getComponentSpec(getState(), specName);
    if (spec == null) throw new Error('Component spec is not defined.');
    const id = uuid();
    const { scope, name } = getScopeAndName(componentNameAndScope);
    const { description } = {
      ...createComponentOptionDefaults,
      ...options,
    };
    Object.keys(properties).forEach((propName) => {
      if (spec.properties[propName] == null) throw new Error(`Component prop ${propName} is not defined.`);
    });
    const props = forEachObject(spec.properties, ([propName, propSpec]) => {
      const prop = (properties as any)[propName] as PartialProps | undefined;
      const newProp: DefineComponentProperty = {
        name: propName,
        value: prop?.value ?? propSpec.default,
        func: prop?.func ?? '',
      };
      return [propName, newProp];
    });
    const evts = forEachObject(events, ([evtName, evt]) => {
      const newEvt: ComponentEvent = {
        ...evt,
        name: evtName,
      };
      return [evtName, newEvt];
    });
    dispatch(defineComponent({
      spec: specName, id, scope, name, description, events: evts, properties: props,
    }));
    return componentShortcut(dispatch, getState, id) as ComponentShortcut<keyof typeof properties>;
  };
}
