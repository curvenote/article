import '@material/mwc-slider';
import { html, PropertyValues, css } from 'lit-element';
import { types } from '@iooxa/runtime';
import { throttle } from 'underscore';
import { BaseComponent, withInk, onBindChange } from './base';
import { HTMLElementEvent, THROTTLE_SKIP } from '../types';

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

  #throttled: ((v: number) => void) | null = null;

  render() {
    const {
      value, min, max, step,
    } = this.ink!.state;

    if (this.#throttled == null) {
      this.#throttled = throttle((val: number) => this.ink?.dispatchEvent('change', [val]), THROTTLE_SKIP);
    }

    const changeHandler = (event: HTMLElementEvent<HTMLInputElement>) => {
      const newValue = Number.parseFloat(event.target.value);
      this.#throttled!(newValue);
    };

    const [small, big] = [Math.min(min, max), Math.max(min, max)];

    return html`<div><mwc-slider min="${small}" step="${step}" max="${big}" value="${value}" @input="${changeHandler}"></mwc-slider><div>`;
  }

  static get styles() {
    return css`
    :host{
      margin: 5px;
      display: inline-block;
      white-space: normal;
      margin-top: -15px;
    }
    mwc-slider{
      height: 0;
      transform: translate(0, -31px);
    }`;
  }
}

export default InkRange;
