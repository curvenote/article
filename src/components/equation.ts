import { BaseComponent, withRuntime, html, css, unsafeHTML } from '@curvenote/components';
import { types, provider } from '@curvenote/runtime';
import katex from 'katex';

export const katexCSS = html`<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/katex@0.13.11/dist/katex.min.css"
  integrity="sha384-Um5gpz1odJg5Z4HAmzPtgZKdTBHZdw8S29IecapCSB31ligYPhHQZMIlWLYQGVoc"
  crossorigin="anonymous"
/>`;

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
    const text2Math = () =>
      setTimeout(() => {
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
      :host {
        position: relative;
        white-space: normal;
      }
      .katex-html {
        user-select: none;
      }
    `;
  }

  render() {
    const element = document.createElement('div');
    const { math } = this.$runtime!.state;
    const { inline, aligned, editing } = this;
    if (math?.trim()) {
      try {
        const render = math.replace(/−/g, '-');
        katex.render(aligned ? `\\begin{aligned}${render}\\end{aligned}` : render, element, {
          displayMode: !inline,
          macros: {
            '\\boldsymbol': '\\mathbf',
          },
        });
      } catch (error) {
        element.innerText = error;
      }
    } else {
      const placeholder = document.createElement('div');
      placeholder.innerText = '$…$';
      if (!inline) {
        placeholder.style.textAlign = 'center';
        placeholder.style.margin = '1rem';
      }
      element.append(placeholder);
    }
    return html`${katexCSS}${unsafeHTML(element.innerHTML)}<slot ?hidden=${!editing}></slot>`;
  }
}

export default Equation;
