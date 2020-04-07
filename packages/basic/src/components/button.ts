import { html } from 'lit-element';
import { types } from '@iooxa/ink-store';
import { BaseComponent, withInk } from './base';

export const InkButtonSpec = {
  name: 'button',
  description: 'Input button element',
  properties: {
    text: { type: types.PropTypes.string, default: 'Click Here' },
  },
  events: {
    click: { args: [] },
  },
};

@withInk(InkButtonSpec, { bind: { type: String, reflect: true } })
class InkButton extends BaseComponent<typeof InkButtonSpec> {
  render() {
    const { text } = this.ink!.state;
    return html`<input type="button" value="${text}" @click="${() => this.ink?.dispatchEvent('click')}"></input>`;
  }
}

export default InkButton;
