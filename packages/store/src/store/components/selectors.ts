import { State as FullState } from '../types';
import { ComponentSpec, Component, ComponentProperty } from './types';
import { forEachObject, Dictionary } from '../../utils';
import { VariableTypes } from '../variables/types';

type State = Pick<FullState, 'components'>;

export const getComponentSpec = (state: State, name: string): ComponentSpec | undefined => (
  state.components.specs[name] ?? undefined
);

export const getComponent = (state: State, id: string): Component | undefined => (
  state.components.components[id] ?? undefined
);

export function getComponentState<T extends string | number | symbol>(state: State, id: string) {
  const component = getComponent(state, id);
  const spec = getComponentSpec(state, component?.spec as string);
  if (component == null || spec == null) return undefined;
  const props: Dictionary<ComponentProperty> = component.properties;
  const values = forEachObject(spec.properties, ([propName, propSpec]) => (
    [propName, props[propName].current ?? propSpec.default]
  ));
  return values as Record<T, VariableTypes>;
}
