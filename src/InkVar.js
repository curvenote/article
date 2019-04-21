import { LitElement, html } from 'lit-element';
const Format = require('d3-format');
const Drag = require('d3-drag');
const Selection = require('d3-selection');

let HORIZONTAL_SCROLL_CLASS = 'ink-drag-horz';

import { BaseGetProps, propDef, getProp, setProp, getPropFunction, dispatchUpdates, getIFrameFunction } from './InkDynamicProps.js';


class BaseDynamic extends BaseGetProps{
    static get properties() {
        return {
            name: { type: String, reflect: false },
            description: { type: String, reflect: false },
            value: { type: Number, reflect: false },
            valueFunctionString: {type: String, attribute: ":value", reflect: true},
            format: { type: String, reflect: false },
            // scope: { type: String, reflect: false },
            ...propDef('transform', String),
        };
    }

    get transform() { return getProp(this, 'transform'); }
    set transform(val) { return setProp(this, 'transform', val); }
    get transformFunction() { return getPropFunction(this, 'transform'); }

    get setValue(){
        return true;
    }
    setDefaults(){
        this.name = null;
        this.value = 0;
        this.valueFunctionString = undefined;
        this.format = undefined;
        this.description = "";
        this.transform = 'value';
        // this.scope = undefined;
    }
    subscribe() {
        if(this.unsubscribe){
            this.unsubscribe();
        }
        this.unsubscribe = this.store.subscribe(() => {
            let variable = this.store.getState().variables[this.name];
            if(variable === undefined || this.value == variable.value){
                return;
            }
            this.value = variable.value;
        });
    }
    formatter(value){
        if(typeof value === 'string'){return value;}
        let variable = this.store.getState().variables[this.name];
        let def = undefined;
        if(variable){
            def = variable.format;
        }
        return Format.format(this.format || def || ".1f")(value);
    }
    firstUpdated() {
        this.value = this.store.getState().variables[this.name];
        this.subscribe();
    }
    disconnectedCallback(){
        this.unsubscribe();
    }
    updated(changedProperties) {
        changedProperties.forEach((oldValue, propName) => {
            switch (propName) {
                case 'value':
                    if(!this.setValue){
                        return
                    }
                    return this.store.dispatch({
                        type: 'UPDATE_VARIABLE',
                        name: this.name,
                        value: this.value,
                    });
                case 'name':
                    // Check if the bound variable is legit
                    this.subscribe();
                    this.value = this.store.getState().variables[this.name];
                    return;
                default:
                    return;
            }
        });
    }
}


class InkVar extends BaseDynamic {
    render() {
        // Not very exciting, render a hidden span.
        return html`<span hidden>${this.formatter(this.value)}</span>`;
    }

    firstUpdated() {
        this.dispatch(true);
        this.subscribe();
    }

    get derived() {
        let s = this.valueFunctionString;
        return !(s === undefined || s === null || s === '');
    }

    get valueFunction() {
        if(!this.derived){
            // ensure the function is deleted
            this._valueFunction === undefined;
            return undefined;
        }
        if(this._valueFunction === undefined){
            // create the function if it isn't there already
            console.log(this.name, 'Creating function', this.valueFunctionString);
            this._valueFunction = getIFrameFunction(this.iframe, this.valueFunctionString);
        }
        return this._valueFunction;
    }

    get value() {
        if(this.derived){
            let oldVal = this._value;
            try{
                let val = this.valueFunction();
                // update the iframe variable
                this.iframe.contentWindow[this.name] = val;
                this.valueFunctionError = false;
                this._value = val;
            }catch(err){
                console.log('Could not evaluate the function', err);
                this.valueFunctionError = err.message;
                this.iframe.contentWindow[this.name] = Number.NaN;
                this._value = Number.NaN;
            }
            let same = this._value == oldVal;
            let bothNaN = Number.isNaN(this._value) && Number.isNaN(oldVal);
            if( same || bothNaN ) {
                // The variable exists and is the same, return.
                return this._value;
            }
            this.requestUpdate('value', oldVal);
        }
        return this._value;
    }

    set value(x) {
        let oldVal = this._value;
        this._value = x;
        console.log(this.name, 'updating value', x, oldVal);
        this.requestUpdate('value', oldVal);
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
        console.log(this.name, 'updating var', action);
        this.store.dispatch(action);
    }

    updated(changedProperties) {
        console.log(this.name, changedProperties, this.value, this.valueFunctionString);
        changedProperties.forEach((oldValue, propName) => {
            switch (propName) {
                case 'valueFunctionString':
                    this._valueFunction = undefined;
                    this.dispatch();
                case 'value':
                    // TODO: remove old value and dispatch and subscribe to a new name
                case 'name':
                    // TODO: remove old value and dispatch and subscribe to a new name
                    this.subscribe();
                default:
                  return;
            }
        });
    }
}

customElements.define('ink-var', InkVar);

export { InkVar };
