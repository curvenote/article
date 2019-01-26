import { LitElement, html } from '@polymer/lit-element';
import { combineReducers, createStore } from 'redux'
const Format = require('d3-format');
const Drag = require('d3-drag');
const Selection = require('d3-selection');

var HORIZONTAL_SCROLL_CLASS = 'ink-drag-horz';

// Reducer
function variables(state, action) {
  switch (action.type) {
    case 'UPDATE_VARIABLE':
        var newState = {
            ...state
        };
        newState[action.name] = Object.assign({}, action);
        return newState;
    case 'CREATE_VARIABLE':
        var newState = {
            ...state
        };
        newState[action.name] = Object.assign({}, action);
        return newState;
    default:
        return {};
  }
}

// These should be added inside of a container element
const reducer = combineReducers({ variables });
const store = createStore(reducer);
store.dispatch({type: 'INITIALIZE'});

window.store = store;

class BaseDynamic extends LitElement{
    static get properties() {
        return {
            name: { type: String, reflect: false },
            description: { type: String, reflect: false },
            value: { type: Number, reflect: false },
            format: { type: String, reflect: false },
        };
    }
    get setValue(){
        return true;
    }
    constructor() {
        super();
        this.setDefaults();
    }
    setDefaults(){
        this.name = null;
        this.value = 0;
        this.format = ".1f";
        this.description = "";
    }
    subscribe() {
        if(this.unsubscribe){
            this.unsubscribe();
        }
        this.unsubscribe = store.subscribe(() => {
            var variable = store.getState().variables[this.name];
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
        this.value = store.getState().variables[this.name];
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
                    return store.dispatch({
                        type: 'UPDATE_VARIABLE',
                        name: this.name,
                        value: this.value,
                        description: this.description,
                        derived: false,
                    });
                case 'name':
                    // Check if the bound variable is legit
                    this.subscribe();
                    this.value = store.getState().variables[this.name];
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
    constructor(){
        super();
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



// This is a hack-y way to create a place to execute javascript with globals.
var iframe = document.createElement('iframe');
iframe.setAttribute('hidden', '');
// iframe.setAttribute('sandbox', '');
document.body.appendChild(iframe);

window.iframe = iframe;

store.subscribe(() =>{
    const variables = store.getState().variables;
    for(var variable in variables){
        iframe.contentWindow[variable] = variables[variable].value;
    }
});


class InkDerived extends BaseDynamic {
    static get properties() {
        return {
            function: String,
            ...super.properties
        };
    }
    setDefaults() {
        super.setDefaults();
        this.function = 'undefined'
    }
    render() {
        return html`<span>${this.formatter(this.value)}</span>`;
    }
    evalFunction(){
        try{
            return this.func();
        }catch(err){
            console.log('Could not evaluate the function', err)
            return;
        }
    }
    subscribe() {
        if(this.unsubscribe){
            this.unsubscribe();
        }
        this.unsubscribe = store.subscribe(() => {
            this.value = this.evalFunction();
            iframe.contentWindow[this.name] = this.value;
            if(Number.isNaN(this.value)){
                return;
            }
            if(store.getState().variables[this.name] && store.getState().variables[this.name].value == this.value){
                return;
            }
            store.dispatch({
                type: 'UPDATE_VARIABLE',
                name: this.name,
                value: this.value,
                description: this.description,
                derived: true,
            });
        });
    }
    updated(changedProperties) {
        changedProperties.forEach((oldValue, propName) => {
            switch (propName) {
                case 'function':
                    this.func = iframe.contentWindow.Function('"use strict";return ' + this.function + '');
                    this.value = this.evalFunction();
                    return;
                case 'name':
                    this.subscribe();
                default:
                  return;
            }
        });
    }
}

customElements.define('ink-derived', InkDerived);


class InkVarList extends LitElement{
    static get properties() {
        return {
            variables: { type: Object, reflect: false }
        };
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
        this.unsubscribe = store.subscribe(() => {
            this.variables = store.getState().variables;
        });
    }
    formatter(value){
        return Format.format(this.format)(value);
    }
    firstUpdated() {
        this.variables = store.getState().variables;
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
            </style>
            <dl>
              ${Object.keys(vars).map(key => html`
                      <dt title=${ vars[key].name }><code>${ vars[key].name }</code></dt><dd><span class="value">${ this.formatter(vars[key].value) }</span> ${ vars[key].description || '' }</dd>
              `)}
            </div>`;
    }
}

customElements.define('ink-var-list', InkVarList);



// TODO: This needs to be combined with ink-derived. `value="{{ x * x }}""`  or something?

class InkVar extends BaseDynamic {
    render() {
        return html`<span hidden>${this.formatter(this.value)}</span>`;
    }
    evalFunction(){
        try{
            return this.func();
        }catch(err){
            console.log('Could not evaluate the function', err)
            return;
        }
    }
    firstUpdated() {
        // if value
        const action = {
            type: 'CREATE_VARIABLE',
            name: this.name,
            value: this.value,
            description: this.description,
            // TODO: Default formating
            derived: true,
        }
        store.dispatch(action);
        console.log('created var', action)
        this.subscribe();
    }
    // subscribe() {
    //     if(this.unsubscribe){
    //         this.unsubscribe();
    //     }
    //     this.unsubscribe = store.subscribe(() => {
    //         this.value = this.evalFunction();
    //         iframe.contentWindow[this.name] = this.value;
    //         if(Number.isNaN(this.value)){
    //             return;
    //         }
    //         if(store.getState().variables[this.name] && store.getState().variables[this.name].value == this.value){
    //             return;
    //         }
    //         store.dispatch({
    //             type: 'UPDATE_VARIABLE',
    //             name: this.name,
    //             value: this.value,
    //             description: this.description,
    //             derived: true,
    //         });
    //     });
    // }
    updated(changedProperties) {
        changedProperties.forEach((oldValue, propName) => {
            switch (propName) {
                case 'function':
                    this.func = iframe.contentWindow.Function('"use strict";return ' + this.function + '');
                    this.value = this.evalFunction();
                    return;
                case 'name':
                    this.subscribe();
                default:
                  return;
            }
        });
    }
}

customElements.define('ink-var', InkVar);

export { InkRange, InkDisplay, InkDynamic, InkDerived, InkVar, InkVarList };
