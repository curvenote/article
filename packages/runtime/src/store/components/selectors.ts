import { State as FullState } from '../types';
import { ComponentSpec, Component, ComponentProperty } from './types';
import { forEachObject } from '../utils';

type State = Pick<FullState, 'components'>;

export const getComponentSpec = (state: State, name: string): ComponentSpec | undefined => (
  state.components.specs[name] ?? undefined
);

export const getComponent = (state: State, id: string): Component | undefined => (
  state.components.components[id] ?? undefined
);

export function getComponentState<T extends {}>(state: State, id: string): T {
  const component = getComponent(state, id);
  const spec = getComponentSpec(state, component?.spec as string);
  if (component == null || spec == null) return {} as T;
  const props: Record<string, ComponentProperty> = component.properties;
  const values = forEachObject(spec.properties, ([propName, propSpec]) => (
    [propName, props[propName].current ?? propSpec.default]
  ));
  return values as T;
}
