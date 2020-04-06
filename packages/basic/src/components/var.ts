/* eslint-disable no-underscore-dangle */
import { html } from 'lit-element';
import { actions, types } from '@iooxa/ink-store';
import { store } from '../provider';
import { formatter } from '../utils';
import { BaseSubscribe } from './base';

class InkVar extends BaseSubscribe {
  static get properties() {
    return {
      name: { type: String, reflect: true },
      value: { type: String, reflect: true },
      valueFunction: { type: String, reflect: true, attribute: ':value' },
      format: { type: String, reflect: true },
      description: { type: String, reflect: true },
    };
  }

  ink: types.VariableShortcut | null = null;

  name = '';

  value = '';

  valueFunction = '';

  format = '.1f';

  description = '';

  connectedCallback() {
    super.connectedCallback();
    const {
      scope, name, description, value, valueFunction, format,
    } = this;
    this.ink = store.dispatch(actions.createVariable(`${scope}.${name}`, value, valueFunction, {
      description,
      type: types.PropTypes.number,
      format,
    }));
    this.subscribe(this.ink.id);
  }

  updated(changedProperties: Map<string, string>) {
    const {
      scope, name, description, value, valueFunction, format,
    } = this;
    if (changedProperties == null || changedProperties.size === 0) return;
    this.ink?.set(value, valueFunction, {
      scope: scope ?? 'global',
      name,
      description,
      type: types.PropTypes.number,
      format,
    });
  }

  render() {
    const {
      name, current, func, format, derived,
    } = this.ink?.variable ?? {};
    return html`<span>${name} := ${derived ? html`<code>${func} = ${current}</code>` : formatter(current, format)}</span>`;
  }
}

export default InkVar;
