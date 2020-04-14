import { html } from 'lit-element';
import {
  actions, types, InkVarSpec, provider,
} from '@iooxa/runtime';
import { formatter } from '../utils';
import { BaseSubscribe, withInk } from './base';

@withInk(InkVarSpec)
class InkVar extends BaseSubscribe {
  connectedCallback() {
    super.connectedCallback();
    const { scope } = this;
    const name = this.getAttribute('name') as string;
    this.ink = provider.dispatch(actions.createVariable(
      `${scope}.${name}`,
      this.getAttribute('value') ?? InkVarSpec.properties.value.default,
      this.getAttribute(':value') ?? '',
      {
        description: this.getAttribute('description') ?? '',
        type: this.getAttribute('type') as types.PropTypes ?? InkVarSpec.properties.type.default,
        format: this.getAttribute('format') ?? InkVarSpec.properties.format.default as types.PropTypes,
      },
    ));
    this.subscribe(this.ink.id);
  }

  render() {
    const {
      name, value, current, func, format, derived,
    } = this.ink!.state;
    // TODO: show error if name is not defined
    const formatted = (typeof current === 'string') ? `"${current}"` : formatter(current, format);
    if (derived) {
      return html`<code>function ${name}() { return ${func}; }</code> = ${formatted}`;
    }
    const formattedValue = formatter(value, format);
    return html`${name} = ${formattedValue}, Current: ${formatted}`;
  }
}

export default InkVar;
