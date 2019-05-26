import { LitElement, html } from 'lit-element';
const Format = require('d3-format');

import { BaseGetProps, propDef, getProp, setProp, getPropFunction, dispatchUpdates, getIFrameFunction } from './InkDynamicProps.js';

var isArrayEqual = function (value, other) {
    // https://gomakethings.com/check-if-two-arrays-or-objects-are-equal-with-javascript/

    // Get the value type
    var type = Object.prototype.toString.call(value);

    // If the two objects are not the same type, return false
    if (type !== Object.prototype.toString.call(other)) return false;

    // If items are not an object or array, return false
    if (['[object Array]', '[object Object]'].indexOf(type) < 0) return false;

    // Compare the length of the length of the two items
    var valueLen = type === '[object Array]' ? value.length : Object.keys(value).length;
    var otherLen = type === '[object Array]' ? other.length : Object.keys(other).length;
    if (valueLen !== otherLen) return false;

    // Compare two items
    var compare = function (item1, item2) {

        // Get the object type
        var itemType = Object.prototype.toString.call(item1);

        // If an object or array, compare recursively
        if (['[object Array]', '[object Object]'].indexOf(itemType) >= 0) {
            if (!isArrayEqual(item1, item2)) return false;
        }

        // Otherwise, do a simple comparison
        else {

            // If the two items are not the same type, return false
            if (itemType !== Object.prototype.toString.call(item2)) return false;

            // Else if it's a function, convert to a string and compare
            // Otherwise, just compare
            if (itemType === '[object Function]') {
                if (item1.toString() !== item2.toString()) return false;
            } else {
                if (item1 !== item2) return false;
            }

        }
    };

    // Compare properties
    if (type === '[object Array]') {
        for (var i = 0; i < valueLen; i++) {
            if (compare(value[i], other[i]) === false) return false;
        }
    } else {
        for (var key in value) {
            if (value.hasOwnProperty(key)) {
                if (compare(value[key], other[key]) === false) return false;
            }
        }
    }

    // If nothing failed, return true
    return true;

};


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
            if(variable.value.length !== undefined){
                same = isArrayEqual(variable.value, val);
            }
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
