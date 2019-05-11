import { LitElement, html } from 'lit-element';
import {unsafeHTML} from 'lit-html/directives/unsafe-html.js';
import katex from 'katex';
import { katexCSS } from './styles.js';


import { BaseGetProps, propDef, getProp, setProp, getPropFunction, getIFrameFunction } from './InkDynamicProps.js';


class InkEquation extends BaseGetProps {
    static get properties() {
        return {
            inline: {type:Boolean, reflect:true},
            ...propDef('math', String),
        };
    }

    get math() { return getProp(this, 'math'); }
    set math(val) { return setProp(this, 'math', val); }
    get mathFunction() { return getPropFunction(this, 'math'); }

    setDefaults(){
        this.math = '';
        this.inline = false;
    }

    firstUpdated() {
        super.firstUpdated();
        var shadow = this.shadowRoot;
        // Should have a check here that ensures your are pulling math from prop if necessary
        this.math = this.textContent;
        shadow.addEventListener('slotchange', () => {
            // this is for explicit manipulation
            this.math = this.textContent;
        });
    }

    render() {
        // This may have updates due to shadow dom updates.
        this.math = this.textContent;

        var element = document.createElement('div');

        katex.render(this.math, element, {
            displayMode: !this.inline,
            macros: {
              "\\boldsymbol": "\\mathbf"
            }
        });

        return html`
            ${ katexCSS }
            ${ unsafeHTML(element.innerHTML) }
        `;
    }
}

customElements.define('ink-equation', InkEquation);


export { InkEquation };
