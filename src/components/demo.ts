import {
  LitElement, html, css, property,
} from 'lit-element';

// TODO: move over to ink

class InkDemo extends LitElement {
  @property({ type: String }) code = '';

  @property({ type: String }) language = 'html';

  @property({ type: Boolean }) copy = true;

  @property({ type: Boolean, attribute: 'code-only', reflect: true })codeOnly = false;

  firstUpdated() {
    this.code = this.innerHTML;
    this.shadowRoot!.addEventListener('slotchange', () => {
      this.code = this.innerHTML;
    });
  }

  render() {
    return html`
      <div id="demo" ?hidden="${this.codeOnly}"><slot></slot></div>
      <ink-code .code="${this.code}" language="${this.language}" ?copy="${this.copy}"></ink-code>
    `;
  }

  static get styles() {
    return css`
      :host{
        display: block;
        box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 3px 0 rgba(0, 0, 0, 0.12), 0 3px 1px -2px rgba(0, 0, 0, 0.2);
        margin: 20px 0;
      }
      #demo{
        padding: 25px;
        border-bottom: 1px solid #e0e0e0;
      }
    `;
  }
}

export default InkDemo;
