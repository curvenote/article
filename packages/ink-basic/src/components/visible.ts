import { html } from 'lit-element';
import { types } from '@iooxa/runtime';
import { BaseComponent, withInk } from './base';

export const InkVisibleSpec = {
  name: 'visible',
  description: 'Component that reacts to visibility',
  properties: {
    visible: { type: types.PropTypes.boolean, default: true, has: { value: false, func: true } },
  },
  events: {},
};

@withInk(InkVisibleSpec, { bind: { type: String, reflect: true } })
class InkVisible extends BaseComponent<typeof InkVisibleSpec> {
  render() {
    const { visible } = this.ink!.state;
    this.hidden = !visible;
    return html`<slot></slot>`;
  }
}

export default InkVisible;
