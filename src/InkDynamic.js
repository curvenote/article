import { LitElement, html } from '@polymer/lit-element';
import { combineReducers, createStore } from 'redux'

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


class InkRange extends LitElement {
    static get properties() {
        return {
            bind: { type: String, reflect: true },
            value: { type: Number, reflect: true },
        };
    }
    constructor() {
        super();
        this.bind = null;
        this.value = 0;
    }
    render() {
        return html`<input type="range" min="1" max="4" .value="${this.value}" @change="${this._changeHandler} @input="${this._changeHandler}">`;
    }
    subscribe() {
        if(this.unsubscribe){
            this.unsubscribe();
        }
        this.unsubscribe = store.subscribe(() => {
          this.value = store.getState().variables[this.bind];
        });
    }
    firstUpdated() {
        this.subscribe();
    }
    _changeHandler(e) {
        this.value = Number.parseFloat(e.target.value);
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

customElements.define('ink-range', InkRange);



class InkDisplay extends LitElement {
    static get properties() {
        return {
            bind: { type: String, reflect: true },
            value: { type: Number, reflect: true },
        };
    }
    constructor() {
        super();
        this.bind = null;
        this.value = 0;
    }
    render() {
        return html`<span>${this.value}</span>`;
    }
    subscribe() {
        if(this.unsubscribe){
            this.unsubscribe();
        }
        this.unsubscribe = store.subscribe(() => {
          this.value = store.getState().variables[this.bind];
        });
    }
    firstUpdated() {
        this.subscribe();
    }
    updated(changedProperties) {
        changedProperties.forEach((oldValue, propName) => {
            switch (propName) {
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

customElements.define('ink-display', InkDisplay);


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

export { InkRange, InkDisplay };
