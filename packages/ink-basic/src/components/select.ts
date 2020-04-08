import '@material/mwc-select';
import '@material/mwc-list/mwc-list-item';
import { html, PropertyValues } from 'lit-element';
import { types } from '@iooxa/runtime';
import { BaseComponent, withInk, onBindChange } from './base';
import { getLabelsAndValues } from './utils';

export const InkSelectSpec = {
  name: 'select',
  description: 'Input button element',
  properties: {
    value: { type: types.PropTypes.string, default: '' },
    label: { type: types.PropTypes.string, default: '' },
    labels: { type: types.PropTypes.string, default: '', description: 'Comma seperated values' },
    values: { type: types.PropTypes.string, default: '', description: 'Comma seperated values' },
  },
  events: {
    change: { args: ['value'] },
  },
};

@withInk(InkSelectSpec, { bind: { type: String, reflect: true } })
class InkSelect extends BaseComponent<typeof InkSelectSpec> {
  updated(updated: PropertyValues) { onBindChange(updated, this, 'change'); }

  render() {
    const {
      label, value, labels: labelsString, values: valuesString,
    } = this.ink!.state;
    const { labels, values } = getLabelsAndValues(labelsString, valuesString);
    const changeHandler = (evt: any) => {
      this.ink?.dispatchEvent('change', [values[evt.detail.index]]);
    };

    return html`<mwc-select label="${label}" @selected=${changeHandler}>${labels.map((item, i) => html`<mwc-list-item value=${values[i]} ?selected=${String(value) === values[i]}>${item}</mwc-list-item>`)}</mwc-select>`;
  }
}

export default InkSelect;
