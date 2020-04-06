import { html, PropertyValues } from 'lit-element';
import { types } from '@iooxa/ink-store';
import { BaseComponent, withInk, onBindChange } from './base';
import { HTMLElementEvent } from '../types';

export const InkRangeSpec = {
  name: 'range',
  description: 'Range input',
  properties: {
    value: { type: types.PropTypes.number, default: 0 },
    min: { type: types.PropTypes.number, default: 0 },
    max: { type: types.PropTypes.number, default: 100 },
    step: { type: types.PropTypes.number, default: 1 },
  },
  events: {
    change: { args: ['value'] },
  },
};

@withInk(InkRangeSpec, { bind: { type: String, reflect: true } })
class InkRange extends BaseComponent<typeof InkRangeSpec> {
  updated(updated: PropertyValues) { onBindChange(updated, this, 'change'); }

  render() {
    const {
      value, min, max, step,
    } = this.ink!.state;

    const changeHandler = (event: HTMLElementEvent<HTMLInputElement>) => {
      const newValue = Number.parseFloat(event.target.value);
      this.ink?.dispatchEvent('change', [newValue]);
    };

    return html`<input type="range" .min="${min}" .step="${step}" .max="${max}" .value="${value}" @input="${changeHandler}">`;
  }
}

export default InkRange;
