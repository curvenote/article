import { LitElement, html } from 'lit-element';
import { combineReducers, createStore } from 'redux'


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
            if(state[action.name]){
                // this is weird, should be already init-ed.
                newState[action.name].format = state[action.name].format;
            }
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

function createDefaultStoreAndIFrame() {
    window.store = getStore();
    window.iframe = getIFrame(window.store);
};


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
            <slot></slot>
        `;
    }
}

customElements.define('ink-scope', InkScope);


export { InkScope, createDefaultStoreAndIFrame };
