import { LitElement, html } from '@polymer/lit-element';
import { combineReducers, createStore } from 'redux'
const Format = require('d3-format');
const Drag = require('d3-drag');
const Selection = require('d3-selection');

var HORIZONTAL_SCROLL_CLASS = 'ink-drag-horz';


function getStore(){
    // Reducer
    function variables(state, action) {
      switch (action.type) {
        case 'UPDATE_VARIABLE':
            var newState = {
                ...state
            };
            newState[action.name] = Object.assign({}, action);
            delete newState[action.name].type;
            return newState;
        case 'CREATE_VARIABLE':
            var newState = {
                ...state
            };
            newState[action.name] = Object.assign({}, action);
            delete newState[action.name].type;
            return newState;
        default:
            return {};
      }
    }

    // These should be added inside of a container element
    const reducer = combineReducers({ variables });
    const store = createStore(reducer);
    store.dispatch({type: 'INITIALIZE'});
    return store;
}

function getIFrame(store){
    // This is a hack-y way to create a place to execute javascript with globals.
    var iframe = document.createElement('iframe');
    iframe.setAttribute('hidden', '');
    // iframe.setAttribute('sandbox', '');
    document.body.appendChild(iframe);

    store.subscribe(() =>{
        const variables = store.getState().variables;
        for(var variable in variables){
            iframe.contentWindow[variable] = variables[variable].value;
        }
    });

    return iframe;
}

window.store = getStore();
window.iframe = getIFrame(window.store);



class InkScope extends LitElement{
    static get properties() {
        return {
            name: { type: String, reflect: true },
        };
    }
    constructor() {
        super();
        this.name = 'window';
    }
    firstUpdated() {
        this.store = getStore();
        this.iframe = getIFrame(this.store);
    }
    render() {
        return html`
            <span>
              <slot></slot>
            </span>
        `;
    }
}

customElements.define('ink-scope', InkScope);


class BaseDynamic extends LitElement{
    static get properties() {
        return {
            name: { type: String, reflect: false },
            description: { type: String, reflect: false },
            value: { type: Number, reflect: true },
            valueFunctionString: {type: String, attribute: ":value", reflect: true},
            format: { type: String, reflect: false },
            // scope: { type: String, reflect: false },
        };
    }
    get setValue(){
        return true;
    }
    get store(){
        var closestScope = this.closest('ink-scope');
        if(closestScope === null){
            return window.store;
        }else{
            return closestScope.store;
        }
    }
    get iframe(){
        var closestScope = this.closest('ink-scope');
        if(closestScope === null){
            return window.iframe;
        }else{
            return closestScope.iframe;
        }
    }
    constructor() {
        super();
        this.setDefaults();
    }
    setDefaults(){
        this.name = null;
        this.value = 0;
        this.valueFunctionString = undefined;
        this.format = ".1f";
        this.description = "";
        // this.scope = undefined;
    }
    subscribe() {
        if(this.unsubscribe){
            this.unsubscribe();
        }
        this.unsubscribe = this.store.subscribe(() => {
            var variable = this.store.getState().variables[this.name];
            if(variable === undefined || this.value == variable.value){
                return;
            }
            this.value = variable.value;
        });
    }
    formatter(value){
        return Format.format(this.format)(value);
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
                        description: this.description,
                        derived: false,
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


class InkDisplay extends BaseDynamic {
    get setValue(){
        return false;
    }
    render() {
        return html`<span>${this.formatter(this.value)}</span>`;
    }
}

customElements.define('ink-display', InkDisplay);


class BaseRange extends BaseDynamic {
    static get properties() {
        return {
            step: { type: Number, reflect: false },
            min: { type: Number, reflect: false },
            max: { type: Number, reflect: false },
            ...super.properties
        };
    }
    setDefaults(){
        super.setDefaults();
        this.step = 1;
        this.min = 0;
        this.max = 10;
    }
}


class InkRange extends BaseRange {
    render() {
        return html`<input type="range" min="${this.min}" step="${this.step}" max="${this.max}" .value="${this.value}" @input="${this._changeHandler}">`;
    }
    _changeHandler(e) {
        this.value = Number.parseFloat(e.target.value);
    }
}
customElements.define('ink-range', InkRange);




class InkDynamic extends BaseRange {
    static get properties() {
        return {
            senstivity: Number,
            dragging: Boolean,
            ...super.properties
        };
    }
    setDefaults(){
        super.setDefaults();
        this.senstivity = 10;
        this.dragging = false;
    }
    render() {
        return html`
        <style>
            .container{
                display: inline-block;
                position: relative;
            }
            .dynamic{
                color: #46f;
                border-bottom: 1px dashed #46f;
                cursor: col-resize;
            }
            .help{
                left: calc(50% - 9px);
                top: -7px;
                position: absolute;
                color: #00f;
                font: 9px "Helvetica-Neue", "Arial", sans-serif;
                display: none;
            }
            .container:hover .help{
                display: block;
            }
        </style>
        <div class="container">
            <span class="dynamic">${ this.formatter(this.value) }</span>
            <div class="help" style="${ this.dragging? 'display:none' : ''}">drag</div>
        </div>
        `;
    }
    firstUpdated() {
        super.firstUpdated();

        const node = this.shadowRoot.children[1].children[0];
        const bodyClassList = document.getElementsByTagName("BODY")[0].classList

        this.drag = Drag.drag().on('start', () => {
            Selection.event.sourceEvent.preventDefault();
            this.dragging = true; // Hides the "drag" tool-tip
            this._prevValue = this.value; // Start out with the actual value
            bodyClassList.add(HORIZONTAL_SCROLL_CLASS);
        }).on('end', () => {
            this.dragging = false;
            bodyClassList.remove(HORIZONTAL_SCROLL_CLASS);
        }).on('drag', () => {
            Selection.event.sourceEvent.preventDefault();
            const dx = Selection.event.dx;
            var { step, value, min, max, senstivity } = this;
            const newValue = Math.max(Math.min(this._prevValue + (dx / senstivity), max), min);
            this._prevValue = newValue; // Store the actual value so the drag is smooth
            this.value = Math.round(newValue/step)*step; // Then round with the step size
        });

        this.drag(Selection.select(node));
    }
}
customElements.define('ink-dynamic', InkDynamic);


class InkVarList extends LitElement{
    static get properties() {
        return {
            variables: { type: Object, reflect: false }
        };
    }
    get store(){
        // todo, update based on scope
        return store;
    }
    constructor(){
        super();
        this.variables = {};
        this.format = ".1f";
    }
    subscribe() {
        if(this.unsubscribe){
            this.unsubscribe();
        }
        this.unsubscribe = this.store.subscribe(() => {
            this.variables = this.store.getState().variables;
        });
    }
    formatter(value){
        return Format.format(this.format)(value);
    }
    firstUpdated() {
        this.variables = this.store.getState().variables;
        this.subscribe();
    }
    disconnectedCallback(){
        this.unsubscribe();
    }
    render() {
        const vars = this.variables || {};

        return html`
            <style>
                dl dt{
                    float: left;
                    width: 70px;
                    overflow: hidden;
                    clear: left;
                    text-align: right;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
                dl dd{
                    margin-left: 80px;
                }
                code{
                    border-radius: 15px;
                    border: 1px solid #E4E4E4;
                    background-color: #FAFAFA;
                    padding: 0 5px;
                }
                .value{
                    text-decoration: underline;
                }
                .error{
                    color: red;
                }
            </style>
            <dl>
              ${Object.keys(vars).map(key => html`
                    <dt title=${ vars[key].name }><code>${ vars[key].name }</code></dt>
                    <dd>
                    ${vars[key].derived ?
                        html`<span class="value${vars[key].error ? ' error' : ''}" title="${vars[key].error || ''}">${ this.formatter(vars[key].value) }</span> <code>${ vars[key].valueFunctionString }</code> ${ vars[key].description || '' }`
                        :
                        html`<span class="value">${ this.formatter(vars[key].value) }</span>${ vars[key].description || '' }`
                    }
                    </dd>
              `)}
            </div>`;
    }
}

customElements.define('ink-var-list', InkVarList);



function getFunction(iframe, value){
    return iframe.contentWindow.Function('"use strict";return ' + value + '');
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
        var s = this.valueFunctionString;
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
            this._valueFunction = getFunction(this.iframe, this.valueFunctionString);
        }
        return this._valueFunction;
    }

    get value() {
        if(this.derived){
            let oldVal = this._value;
            try{
                var val = this.valueFunction();
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
            var same = this._value == oldVal;
            var bothNaN = Number.isNaN(this._value) && Number.isNaN(oldVal);
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
            var variable = this.store.getState().variables[this.name];
            var val = this.value;
            var same = variable.value == val;
            var bothNaN = Number.isNaN(variable.value) && Number.isNaN(val);
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
            // TODO: Default formating
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

export { InkRange, InkDisplay, InkDynamic, InkDerived, InkVar, InkVarList };
