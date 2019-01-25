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
      newState[action.variable] = action.value;
      return newState;
    default:
      return {};
  }
}

// These should be added inside of a container element
const reducer = combineReducers({ variables });
const store = createStore(reducer);

window.store = store;

class BaseDynamic extends LitElement{
    static get properties() {
        return {
            bind: { type: String, reflect: false },
            value: { type: Number, reflect: false },
            step: { type: Number, reflect: false },
            min: { type: Number, reflect: false },
            max: { type: Number, reflect: false },
            format: { type: String, reflect: false },
        };
    }
    constructor() {
        super();
        this.bind = null;
        this.value = 0;
        this.step = 1;
        this.min = 0;
        this.max = 10;
        this.format = ".1f";
    }
    subscribe() {
        if(this.unsubscribe){
            this.unsubscribe();
        }
        this.unsubscribe = store.subscribe(() => {
          this.value = store.getState().variables[this.bind];
        });
    }
    formatter(value){
        return Format.format(this.format)(value);
    }
    firstUpdated() {
        this.value = store.getState().variables[this.bind];
        this.subscribe();
    }
    disconnectedCallback(){
        this.unsubscribe();
    }
    updated(changedProperties) {
        changedProperties.forEach((oldValue, propName) => {
            switch (propName) {
                case 'value':
                    return store.dispatch({
                        type: 'UPDATE_VARIABLE',
                        variable: this.bind,
                        value: this.value,
                    });
                case 'bind':
                    // Check if the bound variable is legit
                    this.subscribe();
                    this.value = store.getState().variables[this.bind];
                    return;
                default:
                  return;
            }
        });
    }
}


class InkRange extends BaseDynamic {
    render() {
        return html`<input type="range" min="${this.min}" step="${this.step}" max="${this.max}" .value="${this.value}" @input="${this._changeHandler}">`;
    }
    _changeHandler(e) {
        this.value = Number.parseFloat(e.target.value);
    }
}
customElements.define('ink-range', InkRange);



class InkDisplay extends BaseDynamic {
    render() {
        return html`<span>${this.formatter(this.value)}</span>`;
    }
}

customElements.define('ink-display', InkDisplay);


class InkDynamic extends BaseDynamic {
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
        console.log(node)
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


// class InkDerived extends LitElement {
//     static get properties() {
//         return {
//             name: String,
//             value: Number,
//         };
//     }
//     constructor() {
//         super();
//         this.name = 'temp';
//         this.value = 0;
//     }
//     render() {
//         return html`<span>${this.value}</span>`;
//     }
//     firstUpdated() {
//         store.subscribe(() => {
//           this.value = store.getState().variables[this.bind];
//         });
//     }
// }

// customElements.define('ink-derived', InkDerived);

export { InkRange, InkDisplay, InkDynamic };
