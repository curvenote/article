import { LitElement, html } from '@polymer/lit-element';
import {unsafeHTML} from 'lit-html/directives/unsafe-html.js';
import katex from 'katex';
import { katexCSS } from './styles.js';


import { BaseGetProps, propDef, getProp, setProp, getPropFunction, getIFrameFunction } from './InkDynamicProps.js';


class InkEquation extends BaseGetProps {
    static get properties() {
        return {
            ...propDef('math', String),
        };
    }

    get math() { return getProp(this, 'math'); }
    set math(val) { return setProp(this, 'math', val); }
    get mathFunction() { return getPropFunction(this, 'math'); }

    setDefaults(){
        this.math = '';
    }

    firstUpdated() {
        // This updates the inside of the element to be in-line with the math property.
        super.firstUpdated();
        var shadow = this.shadowRoot;
        this.math = this.textContent;
        shadow.addEventListener('slotchange', () => {
            this.math = this.textContent;
        });
    }
    render() {
        var div = document.createElement('div');
        katex.render(this.math, div, {
            displayMode: true,
            macros: {
              "\\boldsymbol": "\\mathbf"
            }
        });

        if(this.textContent !== this.math && this.math){
          this.textContent = this.math;
        }

        return html`
            ${ katexCSS }
            ${ unsafeHTML(div.innerHTML) }
            <slot hidden></slot>
        `;
    }
}

customElements.define('ink-equation', InkEquation);


export { InkEquation };
