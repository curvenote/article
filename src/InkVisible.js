import { html } from 'lit-element';
import { BaseGetProps, propDef, getProp, setProp, getPropFunction } from './InkDynamicProps.js';


class BaseVisible extends BaseGetProps {

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

}

class InkSpan extends BaseVisible {
    render() {return html`<span ?hidden="${ !this.visible }"><slot></slot></span>`;}
}
customElements.define('ink-span', InkSpan);

class InkP extends BaseVisible {
    render() {return html`<p ?hidden="${ !this.visible }"><slot></slot></p>`;}
}
customElements.define('ink-p', InkP);

class InkDiv extends BaseVisible {
    render() {return html`<div ?hidden="${ !this.visible }"><slot></slot></div>`;}
}
customElements.define('ink-div', InkDiv);

export { InkSpan, InkP, InkDiv };
