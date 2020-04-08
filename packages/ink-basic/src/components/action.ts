import { html } from 'lit-element';
import { BaseComponent, withInk } from './base';

export const InkActionSpec = {
  name: 'action',
  description: 'Inline text that has an action',
  properties: {
  },
  events: {
    click: { args: [] },
  },
};

@withInk(InkActionSpec, { bind: { type: String, reflect: true } })
class InkAction extends BaseComponent<typeof InkActionSpec> {
  render() {
    return html`<span @click="${() => this.ink?.dispatchEvent('click')}"><slot></slot></span>`;
  }
}

export default InkAction;
