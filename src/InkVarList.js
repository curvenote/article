import { LitElement, html } from 'lit-element';
const Format = require('d3-format');


class InkVarList extends LitElement{
    static get properties() {
        return {
            variables: { type: Object, reflect: false }
        };
    }

    // todo: higher level base class
    get store(){
        let closestScope = this.closest('ink-scope');
        if(closestScope === null){
            return window.store;
        }else{
            return closestScope.store;
        }
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
    formatter(value, format){
        return Format.format(format || this.format)(value);
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

        console.log(vars)

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
                        html`<span class="value${vars[key].error ? ' error' : ''}" title="${vars[key].error || ''}">${ this.formatter(vars[key].value, vars[key].format) }</span> <code>${ vars[key].valueFunctionString }</code> ${ vars[key].description || '' }`
                        :
                        html`<span class="value">${ this.formatter(vars[key].value, vars[key].format) }</span>${ vars[key].description || '' }`
                    }
                    </dd>
              `)}
            </div>`;
    }
}

customElements.define('ink-var-list', InkVarList);

export { InkVarList };
