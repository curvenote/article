import { actions, provider } from '@iooxa/runtime';
import InkEquation from './equation';
import InkCode from './code';
import InkDemo from './demo';
import InkOutline from './outline';


function registerComponent(name: string, component: any) {
  if (component.spec) {
    provider.dispatch(actions.createComponentSpec(
      component.spec!.name,
      component.spec!.properties,
      component.spec!.events,
    ));
  }
  customElements.define(name, component);
}

export const register = () => {
  registerComponent('ink-outline', InkOutline);
  registerComponent('ink-equation', InkEquation);
  registerComponent('ink-code', InkCode);
  registerComponent('ink-demo', InkDemo);
};

export {
  InkOutline,
  InkEquation,
  InkCode,
  InkDemo,
};
