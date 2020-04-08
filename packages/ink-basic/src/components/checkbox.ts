import '@material/mwc-formfield';
import '@material/mwc-checkbox';
import { html, PropertyValues } from 'lit-element';
import { types } from '@iooxa/runtime';
import { BaseComponent, withInk, onBindChange } from './base';
import { HTMLElementEvent } from '../types';

export const InkCheckboxSpec = {
  name: 'checkbox',
  description: 'Inline text that drags a value inside a range',
  properties: {
    value: { type: types.PropTypes.boolean, default: false },
    label: { type: types.PropTypes.string, default: '' },
  },
  events: {
    change: { args: ['value'] },
  },
};

@withInk(InkCheckboxSpec, { bind: { type: String, reflect: true } })
class InkCheckbox extends BaseComponent<typeof InkCheckboxSpec> {
  updated(updated: PropertyValues) { onBindChange(updated, this, 'change'); }

  render() {
    const { value, label } = this.ink!.state;
    const change = (evt: HTMLElementEvent<HTMLInputElement>) => { this.ink?.dispatchEvent('change', [evt.target.checked]); };
    return html`<mwc-formfield label="${label}"><mwc-checkbox ?checked=${value} @change=${change}></mwc-checkbox></mwc-formfield>`;
  }
}

export default InkCheckbox;
