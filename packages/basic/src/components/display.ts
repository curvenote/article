import { html, PropertyValues } from 'lit-element';
import { types } from '@iooxa/ink-store';
import { formatter } from '../utils';
import { BaseComponent, withInk, onBindChange } from './base';

export const InkDisplaySpec = {
  name: 'display',
  description: 'Inline display of values',
  properties: {
    value: { type: types.PropTypes.number, default: NaN },
    format: { type: types.PropTypes.string, default: '.1f' },
  },
  events: {},
};

@withInk(InkDisplaySpec, { bind: { type: String, reflect: true } })
class InkDisplay extends BaseComponent<typeof InkDisplaySpec> {
  updated(updated: PropertyValues) { onBindChange(updated, this); }

  render() {
    const { value, format } = this.ink!.state;
    return html`${formatter(value, format)}`;
  }
}

export default InkDisplay;
