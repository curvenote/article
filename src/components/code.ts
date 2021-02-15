import {
  BaseComponent, withRuntime, html, css, unsafeHTML,
} from '@curvenote/components';
import hljs from './codeHighlightjs';

function trim(content: string) {
  const lines = content.split('\n');
  let left = Infinity;
  let hitContent = false;
  let start = 0;
  let end = lines.length;
  lines.forEach((line, i) => {
    const blank = line.trim().length === 0;
    if (blank && !hitContent) {
      start = i + 1;
      return;
    }
    if (blank) return;
    hitContent = true;
    const leading = line.search(/\S/);
    if (leading < left) {
      left = leading;
    }
    end = i;
  });
  return lines.map((line) => line.slice(left)).slice(start, end + 1).join('\n');
}

function pad(content: string) {
  return `\n${content}\n`;
}

export const CodeSpec = {
  name: 'code',
  description: 'Code',
  properties: {},
  events: {},
};

const litProps = {
  code: { type: String },
  language: { type: String },
  copy: { type: Boolean, reflect: true },
  compact: { type: Boolean, reflect: true },
};

@withRuntime(CodeSpec, litProps)
class Code extends BaseComponent<typeof CodeSpec> {
  #copyText = 'copy';

  code = '';

  language = '';

  copy = false;

  compact = false;

  constructor() {
    super();
    this.code = this.textContent as string;
    this.language = '';
    this.copy = false;
    this.compact = false;
  }

  firstUpdated() {
    // This updates the inside of the element to be in-line with the code property.
    this.shadowRoot!.addEventListener('slotchange', () => {
      this.code = this.textContent as string;
    });
  }

  private copyToClipboard() {
    // From https://github.com/google/material-design-lite/blob/master/docs/_assets/snippets.js
    const snipRange = document.createRange();
    snipRange.selectNodeContents(this.shadowRoot!.querySelector('code') as HTMLElement);
    const selection = window.getSelection();
    selection!.removeAllRanges();
    selection!.addRange(snipRange);
    let result = false;
    try {
      result = document.execCommand('copy');
      this.#copyText = 'done';
    } catch (err) {
      this.#copyText = 'error';
    }
    // Return to the copy button after a second.
    setTimeout(() => { this.#copyText = 'copy'; this.requestUpdate(); }, 1000);

    selection!.removeAllRanges();
    this.requestUpdate();
    return result;
  }

  render() {
    this.code = trim(this.code);

    if (this.textContent !== pad(this.code) && this.code) {
      this.textContent = pad(this.code);
    }

    const codeDom = document.createElement('code');
    if (this.language) {
      codeDom.classList.add(this.language);
    }
    if (this.code) {
      codeDom.textContent = this.code;
      hljs.highlightBlock(codeDom);
    }

    return html`
      <link rel="stylesheet" href="//cdnjs.cloudflare.com/ajax/libs/highlight.js/9.12.0/styles/xcode.min.css">
      <div id="code-wrapper">
        <button ?hidden="${!this.copy}" title="copy to clipboard" @click="${this.copyToClipboard}">${this.#copyText}</button>
        <pre><code class="hljs ${this.language}">${unsafeHTML(codeDom.innerHTML)}</code></pre>
      </div>
      <slot hidden></slot>
    `;
  }

  static get styles() {
    return css`
      :host {
        display: block;
      }
      code {
        line-height: 1.2;
        border:none;
        margin: 10px 0;
      }
      #code-wrapper{
        position: relative;
        padding: 0;
        overflow: hidden;
      }
      button{
        position: absolute;
        top: 0;
        right: 0;
        text-transform: uppercase;
        border: none;
        cursor: pointer;
        background: #e0e0e0;
        outline: none;
        user-select: none;
      }
      pre{
        margin: 0;
      }`;
  }
}

export default Code;
