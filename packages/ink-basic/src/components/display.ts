import { html, PropertyValues } from 'lit-element';
import { types, DEFAULT_FORMAT } from '@iooxa/runtime';
import { formatter } from '../utils';
import { BaseComponent, withInk, onBindChange } from './base';

export const InkDisplaySpec = {
  name: 'display',
  description: 'Inline display of values',
  properties: {
    value: { type: types.PropTypes.number, default: NaN },
    format: { type: types.PropTypes.string, default: DEFAULT_FORMAT },
  },
  events: {},
};

@withInk(InkDisplaySpec, { bind: { type: String, reflect: true } })
class InkDisplay extends BaseComponent<typeof InkDisplaySpec> {
  updated(updated: PropertyValues) { onBindChange(updated, this); }

  render() {
    const { value, format } = this.ink!.state;
    const formatted = formatter(value, format);
    this.textContent = formatted;
    return html`<slot></slot>`;
  }
}

export default InkDisplay;
