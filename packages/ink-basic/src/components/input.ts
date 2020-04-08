import '@material/mwc-textfield';
import { html, PropertyValues } from 'lit-element';
import { types } from '@iooxa/runtime';
import { HTMLElementEvent } from '../types';
import { BaseComponent, withInk, onBindChange } from './base';

export const InkInputSpec = {
  name: 'input',
  description: 'Input text element',
  properties: {
    value: { type: types.PropTypes.string, default: '' },
    label: { type: types.PropTypes.string, default: '' },
  },
  events: {
    change: { args: ['value'] },
  },
};

@withInk(InkInputSpec, { bind: { type: String, reflect: true } })
class InkInput extends BaseComponent<typeof InkInputSpec> {
  updated(updated: PropertyValues) { onBindChange(updated, this, 'change'); }

  render() {
    const { label, value } = this.ink!.state;

    const changeHandler = (event: HTMLElementEvent<HTMLInputElement>) => {
      const newValue = event.target.value;
      this.ink?.dispatchEvent('change', [newValue]);
    };

    return html`<mwc-textfield label="${label}" value=${value} @change="${changeHandler}"></mwc-textfield>`;
  }
}

export default InkInput;
