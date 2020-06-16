import {
  BaseComponent, withRuntime, html, css,
} from '@iooxa/components';

export const DemoSpec = {
  name: 'demo',
  description: 'Demo',
  properties: {},
  events: {},
};

const litProps = {
  code: { type: String },
  language: { type: String },
  copy: { type: Boolean },
  codeOnly: { type: Boolean, attribute: 'code-only', reflect: true },
};

@withRuntime(DemoSpec, litProps)
class Demo extends BaseComponent<typeof DemoSpec> {
  code = '';

  language = 'html';

  copy = true;

  codeOnly = false;

  firstUpdated() {
    this.code = this.innerHTML;
    this.shadowRoot!.addEventListener('slotchange', () => {
      this.code = this.innerHTML;
    });
  }

  render() {
    return html`
      <div id="demo" ?hidden="${this.codeOnly}"><slot></slot></div>
      <r-code .code="${this.code}" language="${this.language}" ?copy="${this.copy}"></r-code>
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
      }
      r-code {
        border-top: 1px solid #e0e0e0;
      }
    `;
  }
}

export default Demo;
