import { LitElement, html } from 'lit-element';
const Format = require('d3-format');
const Drag = require('d3-drag');
const Selection = require('d3-selection');

let CURSOR_DRAG_CLASS = 'ink-drag-horz';

import { BaseGetProps, propDef, getProp, setProp, getPropFunction, dispatchUpdates, getIFrameFunction } from './InkDynamicProps.js';


class BaseDynamic extends BaseGetProps{

    static get properties() {
        return {
            name: String,
            bind: String,
            ...propDef('value', Number),
            ...propDef('transform', String),
            format: String,
        }
    }

    get value() { return getProp(this, 'value'); }
    set value(val) { return setProp(this, 'value', val); }
    get valueFunction() { return getPropFunction(this, 'value'); }

    get transform() { return getProp(this, 'transform'); }
    set transform(val) { return setProp(this, 'transform', val); }
    get transformFunction() { return getPropFunction(this, 'transform'); }

    setDefaults(){
        this.value = 0;
        this.name = undefined;
        this.bind = undefined;
        this.transform = 'value';
        this.format = undefined;
    }

    formatter(value){
        if(typeof value === 'string'){return value;}
        // if bind is simple
        let variable = this.store.getState().variables[this.name];
        let def = undefined;
        if(variable){
            def = variable.format;
        }
        return Format.format(this.format || def || ".1f")(value);
    }

    updated(changedProperties) {
        changedProperties.forEach((oldValue, propName) => {
            switch (propName) {
                case 'name':
                    // Create the defaults based on the name
                    // name < -- > value double binding
                    this.bind = '{' + this.name + ': value}';
                    this.valueFunctionString = this.name;
                    return;
                default:
                    return;
            }
        });
    }

}

class InkDisplay extends BaseDynamic {
    render() {
        let func = getIFrameFunction(this.iframe, this.transform, ['value']);
        return html`<span>${ this.formatter(func(this.value)) }</span>`;
    }
}

customElements.define('ink-display', InkDisplay);

class InkSpan extends BaseGetProps {

    static get properties() {
        return {
            ...propDef('visible', Boolean),
        }
    }

    setDefaults(){
        this.visible = true;
    }

    get visible() { return getProp(this, 'visible'); }
    set visible(val) { return setProp(this, 'visible', val); }
    get visibleFunction() { return getPropFunction(this, 'visible'); }

    render() {
        // TODO: Make this fade in/out or should that it has changed.
        return html`<span ?hidden="${ !this.visible }"><slot></slot></span>`;
    }
}

customElements.define('ink-span', InkSpan);


class BaseRange extends BaseDynamic {
    static get properties() {
        return {
            ...propDef('min', Number),
            ...propDef('max', Number),
            ...propDef('step', Number),
            ...super.properties
        };
    }

    get min() { return getProp(this, 'min'); }
    set min(val) { return setProp(this, 'min', val); }
    get minFunction() { return getPropFunction(this, 'min'); }

    get max() { return getProp(this, 'max'); }
    set max(val) { return setProp(this, 'max', val); }
    get maxFunction() { return getPropFunction(this, 'max'); }

    get step() { return getProp(this, 'step'); }
    set step(val) { return setProp(this, 'step', val); }
    get stepFunction() { return getPropFunction(this, 'step'); }

    setDefaults(){
        super.setDefaults();
        this.step = 1;
        this.min = 0;
        this.max = 10;
    }

    dispatch(val){
        this.value = val;
        if(!this.bind){return;}
        let func = getIFrameFunction(this.iframe, this.bind, ['value']);
        let updates = func(val);
        dispatchUpdates(updates, this.store);
    }
}

class InkRange extends BaseRange {
    render() {
        return html`<input type="range" min="${this.min}" step="${this.step}" max="${this.max}" .value="${this.value}" @input="${this._changeHandler}">`;
    }
    _changeHandler(e) {
        this.dispatch(Number.parseFloat(e.target.value));
    }

}
customElements.define('ink-range', InkRange);



class InkDynamic extends BaseRange {
    static get properties() {
        return {
            ...super.properties,
            sensitivity: {type: Number, reflect: false},
            dragging: {type: Boolean, reflect: false},
        };
    }

    setDefaults() {
        super.setDefaults();
        this.sensitivity = 10;
        this.dragging = false;
    }

    firstUpdated() {
        super.firstUpdated();

        const node = this.shadowRoot.children[1].children[0];
        const bodyClassList = document.getElementsByTagName("BODY")[0].classList;

        this.drag = Drag.drag().on('start', () => {
            Selection.event.sourceEvent.preventDefault();
            this.dragging = true; // Hides the "drag" tool-tip
            this._prevValue = this.value; // Start out with the actual value
            bodyClassList.add(CURSOR_DRAG_CLASS);
        }).on('end', () => {
            this.dragging = false;
            bodyClassList.remove(CURSOR_DRAG_CLASS);
        }).on('drag', () => {
            Selection.event.sourceEvent.preventDefault();

            const dx = Selection.event.dx;

            let { step, value, min, max, sensitivity } = this;

            const newValue = Math.max(Math.min(this._prevValue + (dx / sensitivity), max), min);
            // Store the actual value so the drag is smooth
            this._prevValue = newValue;
            // Then round with the step size
            let val = Math.round( newValue / step ) * step;
            this.dispatch(val);
        });

        this.drag(Selection.select(node));
    }

    render(){
        let func = getIFrameFunction(this.iframe, this.transform, ['value']);

        return html`<style>
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
            <span class="dynamic">${ this.formatter(func(this.value)) }<slot></slot></span>
            <div class="help" style="${ this.dragging? 'display:none' : ''}">drag</div>
        </div>`;
    }
}

customElements.define('ink-dynamic', InkDynamic);


export { InkDisplay, InkRange, InkDynamic };
