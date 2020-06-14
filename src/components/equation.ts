import {
  BaseComponent, withRuntime, html, css, unsafeHTML,
} from '@iooxa/components';
import { types, provider } from '@iooxa/runtime';
import katex from 'katex';

export const katexCSS = html`<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.11.1/katex.min.css" integrity="sha256-V8SV2MO1FUb63Bwht5Wx9x6PVHNa02gv8BgH/uH3ung=" crossorigin="anonymous" />`;

export const EquationSpec = {
  name: 'equation',
  description: 'Equation',
  properties: {
    math: { type: types.PropTypes.string, default: '' },
    labeled: { type: types.PropTypes.boolean, default: false },
  },
  events: {},
};

const litProps = {
  inline: { type: Boolean, reflect: true },
  aligned: { type: Boolean, reflect: true },
  editing: { type: Boolean, reflect: true },
};

@withRuntime(EquationSpec, litProps)
class Equation extends BaseComponent<typeof EquationSpec> {
  inline = false;

  aligned = false;

  editing = false;

  firstUpdated() {
    const text2Math = () => setTimeout(() => {
      if (this.$runtime!.component == null) return;
      const { math } = this.$runtime!.component.properties;
      const slot = this.shadowRoot!.querySelectorAll('slot')[0];
      slot.hidden = false;
      // innerText reads the *visible* content and plays with r-display and r-visible
      const text = this.innerText ?? '';
      slot.hidden = !this.editing;
      if (math.value === text) return;
      this.$runtime!.set({ math: { value: text, func: math.func } });
    }, 20);
    if (this.textContent) {
      this.shadowRoot!.querySelectorAll('slot')[0].addEventListener('slotchange', text2Math);
      text2Math();
      // Explicitly subscribe
      // TODO: clean this up on remove!
      provider.subscribe(null, () => text2Math());
    }
  }

  static get styles() {
    return css`
      :host{
        position: relative;
        white-space: normal;
      }
      .katex-html{
        user-select: none;
      }
    `;
  }

  render() {
    const element = document.createElement('div');
    const { math } = this.$runtime!.state;
    const { inline, aligned, editing } = this;
    if (math) {
      try {
        katex.render(
          aligned ? `\\begin{aligned}${math}\\end{aligned}` : math,
          element,
          {
            displayMode: !inline,
            macros: {
              '\\boldsymbol': '\\mathbf',
            },
          },
        );
      } catch (error) {
        element.innerText = error;
      }
    } else {
      element.innerText = '$…$';
    }
    return html`${katexCSS}${unsafeHTML(element.innerHTML)}<slot ?hidden=${!editing}></slot>`;
  }
}

export default Equation;
