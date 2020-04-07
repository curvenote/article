import { actions } from '@iooxa/ink-store';
import { store } from '../provider';
import InkVar from './var';
import InkDisplay from './display';
import InkRange from './range';
import InkDynamic from './dynamic';
import InkAction from './action';
import InkButton from './button';
import InkSwitch from './switch';
import InkVisible from './visible';


function registerComponent(name: string, component: any) {
  store.dispatch(actions.createComponentSpec(
    component.spec!.name,
    component.spec!.properties,
    component.spec!.events,
  ));
  customElements.define(name, component);
}

export const register = () => {
  customElements.define('ink-var', InkVar);
  registerComponent('ink-display', InkDisplay);
  registerComponent('ink-dynamic', InkDynamic);
  registerComponent('ink-range', InkRange);
  registerComponent('ink-action', InkAction);
  registerComponent('ink-button', InkButton);
  registerComponent('ink-switch', InkSwitch);
  registerComponent('ink-visible', InkVisible);
};

export {
  InkVar,
  InkDisplay,
  InkDynamic,
  InkRange,
  InkAction,
  InkButton,
  InkSwitch,
  InkVisible,
};
