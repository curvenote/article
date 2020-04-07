import { isEqual } from 'underscore';
import {
  Component, DefineComponentSpec, ComponentSpec, ComponentPropertySpec, ComponentEventSpec,
} from './types';
import { compareDefine as compareProperty, forEachObject } from '../utils';

export function compareComponentDefine(prev: Component, next: Component) {
  const one = { ...prev };
  const two = { ...next };
  delete one.properties;
  delete two.properties;
  delete one.events;
  delete two.events;
  if (!isEqual(one, two)) return false;
  const allSame = { current: true };
  Object.entries(prev.properties).forEach(([key, prevProp]) => {
    if (!allSame.current) return;
    allSame.current = compareProperty(prevProp, next.properties[key]);
  });
  if (!allSame.current) return false;
  Object.entries(prev.events).forEach(([key, prevEvt]) => {
    if (!allSame.current) return;
    allSame.current = isEqual(prevEvt, next.events[key]);
  });
  return allSame.current;
}

export function getComponentSpecFromDefinition(specDefinition: DefineComponentSpec): ComponentSpec {
  const spec: ComponentSpec = {
    description: 'No description',
    ...specDefinition,
    properties: forEachObject(
      specDefinition.properties,
      ([name, prop]) => [
        name,
        {
          name,
          type: prop.type,
          default: prop.default,
          description: prop.description ?? '',
          args: prop.args ?? [],
          has: prop.has ?? { value: true, func: true },
        } as ComponentPropertySpec,
      ],
    ),
    events: forEachObject(
      specDefinition.events,
      ([name, evt]) => [
        name,
        {
          name,
          args: evt.args ?? [],
        } as ComponentEventSpec],
    ),
  };
  return spec;
}
