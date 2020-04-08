import '@material/mwc-radio';
import { html, css, PropertyValues } from 'lit-element';
import { types } from '@iooxa/runtime';
import { BaseComponent, withInk, onBindChange } from './base';
import { getLabelsAndValues } from './utils';

export const InkRadioSpec = {
  name: 'radio',
  description: 'Input button element',
  properties: {
    value: { type: types.PropTypes.string, default: '' },
    labels: { type: types.PropTypes.string, default: '', description: 'Comma seperated values' },
    values: { type: types.PropTypes.string, default: '', description: 'Comma seperated values' },
  },
  events: {
    change: { args: ['value'] },
  },
};

@withInk(InkRadioSpec, { bind: { type: String, reflect: true } })
class InkRadio extends BaseComponent<typeof InkRadioSpec> {
  updated(updated: PropertyValues) { onBindChange(updated, this, 'change'); }

  static get styles() {
    return css`
      mwc-formfield {
        display: block;
      }
    `;
  }

  render() {
    const { value, labels: labelsString, values: valuesString } = this.ink!.state;
    const { labels, values } = getLabelsAndValues(labelsString, valuesString);
    const changeHandler = (newValue: string) => () => {
      this.ink?.dispatchEvent('change', [newValue]);
    };
    return labels.map((label, i) => html`<mwc-formfield label="${label}"><mwc-radio name=${this.ink!.id}" ?checked=${String(value) === values[i]} @change=${changeHandler(values[i])}></mwc-radio></mwc-formfield>`);
  }
}

export default InkRadio;
