import '@material/mwc-button';
import { html } from 'lit-element';
import { types } from '@iooxa/runtime';
import { BaseComponent, withInk } from './base';

export const InkButtonSpec = {
  name: 'button',
  description: 'Input button element',
  properties: {
    label: { type: types.PropTypes.string, default: 'Click Here' },
  },
  events: {
    click: { args: [] },
  },
};

@withInk(InkButtonSpec, { bind: { type: String, reflect: true } })
class InkButton extends BaseComponent<typeof InkButtonSpec> {
  render() {
    const { label } = this.ink!.state;
    return html`<mwc-button label="${label}" @click="${() => this.ink?.dispatchEvent('click')}"></mwc-button>`;
  }
}

export default InkButton;
