/* eslint-disable max-classes-per-file */
import { LitElement, PropertyDeclaration, PropertyValues } from 'lit-element';
import {
  types, actions, selectors, DEFAULT_SCOPE, utils, provider,
} from '@iooxa/runtime';
import { Unsubscribe } from 'redux';


interface Constructable<T> {
  new(...args: any): T;
}

export class BaseSubscribe extends LitElement {
  ink: any | null = null;

  #scope?: Element;

  public get scope(): string | null {
    const closestScope = this.closest('ink-scope');
    // Always use the *first* scope found. Important on removeVariable.
    if (closestScope != null) this.#scope = closestScope;
    return (this.#scope ?? closestScope)?.getAttribute('name') ?? DEFAULT_SCOPE;
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.ink?.remove();
  }

  subscribe(id: string) {
    this.unsubscribe();
    this.#unsubscribe = provider.subscribe(id, () => this.requestUpdate());
    return this.#unsubscribe;
  }

  #unsubscribe?: Unsubscribe;

  unsubscribe() {
    if (this.#unsubscribe) this.#unsubscribe();
  }
}

export class BaseComponent<T extends types.DefineComponentSpec> extends BaseSubscribe {
  ink: types.ComponentShortcut<{ [P in keyof T['properties']]: (T['properties'])[P]['default'] }> | null = null;

  static spec: types.ComponentSpec | null = null;

  connectedCallback() {
    super.connectedCallback();
    const { spec } = this.constructor as typeof BaseComponent;
    if (spec == null) return;
    const { scope, name } = this as any;
    const initializeProperties: Record<string, types.DefineComponentProperty> = {};
    const initializeEvents: Record<string, types.ComponentEvent> = {};
    Object.entries(spec.properties).forEach(([key, prop]) => {
      initializeProperties[key] = {
        name: key,
        value: this.getAttribute(key) ?? prop.default,
        func: this.getAttribute(`:${key}`) ?? '',
      };
    });
    Object.entries(spec.events ?? {}).forEach(([key]) => {
      initializeEvents[key] = {
        name: key,
        func: this.getAttribute(`:${key}`) ?? '',
      };
    });
    const component = provider.dispatch(actions.createComponent(spec.name, `${scope}.${name}Component`, initializeProperties, initializeEvents));
    this.ink = component as unknown as types.ComponentShortcut<{ [P in keyof T['properties']]: (T['properties'])[P]['default'] }>;
    this.subscribe(this.ink.id);
  }
}

/* withInk

A class wrapper intended for use with BaseComponent

```
@withInk(ComponentSpec)
class MyComponent extends BaseComponent {...}
```

The wrapper inserts:
  * Getters and Setters for each:
    * property
      * these are `${prop}`
    * property Function
      * these are `${prop}Function`
    * event
      * these are `on${Prop}Event` (capital P)
  * `properties` (for lit-element)
    * Two for each in the property spec
      * `${prop}`
      * `${prop}Function` with the attribute `:${prop}`
    * One for each in the events spec
      * `on${Prop}Event` with the attribute `:${prop}`
  * static `spec` attribute
*/
export function withInk<
T extends types.DefineComponentSpec,
C extends Constructable<BaseComponent<T>>
  >(specDefinition: T, additionalProperties: { [key: string]: PropertyDeclaration } = {}) {
  return (ComponentClass: C) => {
    const litProperties = { ...additionalProperties };

    const spec = utils.getComponentSpecFromDefinition(specDefinition);

    // Add the properties
    Object.entries(spec.properties).forEach(([key, prop]) => {
      if (!prop.has.value) return;
      litProperties[key] = { type: String };
      Object.defineProperty(ComponentClass.prototype, key, {
        get() {
          return this.ink?.state?.[key];
        },
        set(value: string) {
          if (value == null) {
            this.removeAttribute(key);
            const prevFunc = this.ink?.component.properties[key].func;
            this.ink?.setProperties({ [key]: { value: value ?? prop.default, func: prevFunc } });
          } else {
            this.setAttribute(key, String(value));
            this.removeAttribute(`:${key}`);
            this.ink?.setProperties({ [key]: { value: value ?? prop.default, func: '' } });
          }
        },
      });
    });

    // Add the property functions
    Object.entries(spec.properties).forEach(([key, prop]) => {
      if (!prop.has.func) return;
      litProperties[`${key}Function`] = { type: String, attribute: `:${key}` };
      Object.defineProperty(ComponentClass.prototype, `${key}Function`, {
        get() {
          return this.ink?.component.properties[key].func;
        },
        set(value: string) {
          if (value == null) {
            this.removeAttribute(`:${key}`);
          } else {
            this.setAttribute(`:${key}`, String(value).trim());
          }
          const prevValue = this.ink?.component.properties[key].value;
          this.ink?.setProperties({ [key]: { value: prevValue, func: String(value ?? '').trim() } });
        },
      });
    });


    Object.entries(spec.events ?? {}).forEach(([key]) => {
      // Add the property
      const onKeyEvent = `on${key.slice(0, 1).toUpperCase()}${key.slice(1)}Event`;
      litProperties[onKeyEvent] = { type: String, attribute: `:${key}` };

      Object.defineProperty(ComponentClass.prototype, onKeyEvent, {
        get() {
          return this.ink?.component.events[key].func;
        },
        set(value: string) {
          if (value == null) {
            this.removeAttribute(`:${key}`);
            this.ink?.set({}, { [key]: { func: String(value).trim() ?? '' } });
          } else {
            this.setAttribute(`:${key}`, String(value).trim());
            this.ink?.set({}, { [key]: { func: String(value).trim() ?? '' } });
          }
        },
      });
    });

    Object.defineProperty(ComponentClass, 'properties', {
      get() { return litProperties; },
    });

    Object.defineProperty(ComponentClass, 'spec', {
      get() { return spec; },
    });
  };
}


export function onBindChange(
  updated: PropertyValues, component: BaseComponent<any>, eventKey?: string,
) {
  if (!updated.has('bind')) return;
  const { bind } = component as any;
  if (bind == null || bind === '') return;

  const { spec } = component.constructor as typeof BaseComponent;
  const variable = selectors.getVariableByName(provider.getState(), `${component.scope}.${bind}`);
  const props: any = {
    value: { value: null, func: bind },
  };
  if ('format' in spec!.properties) {
    props.format = { value: variable?.format ?? spec!.properties.format.default };
  }
  const events = eventKey ? { [eventKey]: { func: `{${bind}: value}` } } : {};
  component.ink?.set(props, events);
}
