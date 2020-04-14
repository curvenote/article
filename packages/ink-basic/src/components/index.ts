import { actions, provider } from '@iooxa/runtime';
import InkVar from './variable';
import InkDisplay from './display';
import InkRange from './range';
import InkDynamic from './dynamic';
import InkAction from './action';
import InkButton from './button';
import InkSwitch from './switch';
import InkCheckbox from './checkbox';
import InkRadio from './radio';
import InkSelect from './select';
import InkInput from './input';
import InkVisible from './visible';


function registerComponent(name: string, component: any) {
  provider.dispatch(actions.createComponentSpec(
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
  registerComponent('ink-checkbox', InkCheckbox);
  registerComponent('ink-radio', InkRadio);
  registerComponent('ink-select', InkSelect);
  registerComponent('ink-input', InkInput);
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
  InkCheckbox,
  InkRadio,
  InkSelect,
  InkInput,
  InkVisible,
};
