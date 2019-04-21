import { LitElement, html } from 'lit-element';
const Format = require('d3-format');

import { BaseGetProps, propDef, getProp, setProp, getPropFunction, dispatchUpdates, getIFrameFunction } from './InkDynamicProps.js';


class InkVar extends BaseGetProps{

    static get properties() {
        return {
            name: { type: String, reflect: false },
            ...propDef('value', Number),
            bind: String,
            description: { type: String, reflect: false },
            format: { type: String, reflect: false },
            // scope: { type: String, reflect: false },
        };
    }

    get value() { return getProp(this, 'value'); }
    set value(val) { return setProp(this, 'value', val); }
    get valueFunction() { return getPropFunction(this, 'value'); }

    formatter(value){
        if(typeof value === 'string'){return value;}
        let variable = this.store.getState().variables[this.name];
        let def = undefined;
        if(variable){
            def = variable.format;
        }
        return Format.format(this.format || def || ".1f")(value);
    }

    setDefaults(){
        this.name = null;
        this.value = 0;
        this.format = undefined;
        this.description = "";
        // this.scope = undefined;
    }

    firstUpdated() {
        this.dispatch(true);
        this.subscribe();
    }

    render() {
        // Not very exciting, render a hidden span.
        return html`<span hidden>${this.formatter(this.value)}</span>`;
    }

    get derived() {
        let s = this.valueFunctionString;
        return !(s === undefined || s === null || s === '');
    }

    subscribe() {
        if(this.unsubscribe){
            this.unsubscribe();
        }
        this.unsubscribe = this.store.subscribe(() => {
            let variable = this.store.getState().variables[this.name];
            let val = this.value;
            let same = variable.value == val;
            let bothNaN = Number.isNaN(variable.value) && Number.isNaN(val);
            if(variable && ( same || bothNaN ) ){
                // The variable exists and is the same, return.
                return;
            }
            if(this.derived){
                this.dispatch();
            }else{
                this.value = variable.value;
            }
        });
    }

    dispatch(firstUpdated){
        const action = {
            type: firstUpdated ? 'CREATE_VARIABLE' : 'UPDATE_VARIABLE',
            name: this.name,
            value: this.value,
            valueFunctionString: this.valueFunctionString,
            description: this.description,
            format: this.format,
            derived: this.derived,
            error: this.valueFunctionError,
        };
        // console.log(this.name, 'updating var', action);
        this.store.dispatch(action);
    }

    updated(changedProperties) {
        // console.log(this.name, changedProperties, this.value, this.valueFunctionString);
        changedProperties.forEach((oldValue, propName) => {
            switch (propName) {
                case 'name':
                    // Do not update valueFunctionString with name as this is derived.
                    this.bind = '{' + this.name + ': value}';
                default:
                  return;
            }
        });
    }
}

customElements.define('ink-var', InkVar);

export { InkVar };
