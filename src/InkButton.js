import { LitElement, html } from 'lit-element';
const Format = require('d3-format');
const Drag = require('d3-drag');
const Selection = require('d3-selection');

let HORIZONTAL_SCROLL_CLASS = 'ink-drag-horz';

import { BaseGetProps, propDef, getProp, setProp, getPropFunction, dispatchUpdates, getIFrameFunction } from './InkDynamicProps.js';


class InkAction extends BaseGetProps{

    static get properties() {
        return {
            bind: String,
        }
    }

    setDefaults(){
        this.bind = undefined;
    }

    dispatch(){
        if(!this.bind){return;}
        let func = getIFrameFunction(this.iframe, this.bind, []);
        let updates = func();
        dispatchUpdates(updates, this.store);
    }

    render() {
        return html`
            <style>
                .dynamic{
                    color: #46f;
                    border-bottom: 1px dashed #46f;
                    cursor: pointer;
                }
            </style>
            <span class="dynamic" @click="${this.dispatch}"><slot></slot></span>`;
    }

}
customElements.define('ink-action', InkAction);


class InkButton extends BaseGetProps{

    static get properties() {
        return {
            bind: String,
            ...propDef('text', String),
        }
    }

    get text() { return getProp(this, 'text'); }
    set text(val) { return setProp(this, 'text', val); }
    get textFunction() { return getPropFunction(this, 'text'); }

    setDefaults(){
        this.bind = undefined;
        this.text = 'Click Me!';
    }

    dispatch(){
        if(!this.bind){return;}
        let func = getIFrameFunction(this.iframe, this.bind, []);
        let updates = func();
        dispatchUpdates(updates, this.store);
    }

    render() {
        return html`<input type="button" value="${this.text}" @click="${this.dispatch}">`;
    }

}
customElements.define('ink-button', InkButton);


export { InkButton, InkAction };
