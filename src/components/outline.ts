/* eslint-disable no-restricted-globals */
import { BaseComponent, withInk, html } from '@iooxa/ink-basic';
import { css } from 'lit-element';
import { title2name } from './utils';

export const InkOutlineSpec = {
  name: 'outline',
  description: 'Outline',
  properties: {},
  events: {},
};

const litProps = {
  for: { type: String, reflect: true },
};

interface Header {
  id: string;
  level: number;
  title: string;
  element: Element;
}

@withInk(InkOutlineSpec, litProps)
class InkOutline extends BaseComponent<typeof InkOutlineSpec> {
  #headers: Header[] = [];

  #lastSeen: Element | null = null;

  #onScreen: Set<Element> = new Set();

  firstUpdated() {
    const element = document.getElementById((this as any).for);
    if (element == null) {
      // eslint-disable-next-line no-console
      console.warn(`ink-outline: No element was found for ID="${(this as any).for}"`);
      return;
    }
    const headers = element?.querySelectorAll('H1, H2, H3, H4, H5, H6');
    if (headers == null || headers.length < 3) {
      // No need for an outline!
      this.#headers = [];
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        this.#onScreen[entry.isIntersecting ? 'add' : 'delete'](entry.target);
        if (!entry.isIntersecting) this.#lastSeen = entry.target;
      });
      this.requestUpdate();
    }, { threshold: [0] });

    const headerData: Header[] = [];
    headers.forEach((header) => {
      const id = title2name(header.textContent ?? '');
      if (!header.id) header.setAttribute('id', id);
      headerData.push({
        id,
        level: parseInt(header.tagName[1], 10) - 1,
        title: header.textContent ?? '',
        element: header,
      });
    });
    this.#headers = headerData;
    headers.forEach((header) => observer.observe(header));
    this.requestUpdate();
  }

  static get styles() {
    return css`
      nav{
        width: 30px;
        z-index: 100;
        overflow: hidden;
        transition: all 200ms;
        user-select: none;
      }
      .header{
        position: relative;
      }
      .text{
        font-size: 12px;
        line-height: 2em;
        width: 150px;
        text-overflow: ellipsis;
        overflow: hidden;
        font-family: "Roboto", sans-serif;
        white-space: nowrap;
        opacity: 0;
        transition: all 200ms;
        transition-timing-function: cubic-bezier(0, 0.58, 0.55, 1.36);
      }
      .tick{
        position: absolute;
        left: 0px;
        top: 9px;
        border-bottom: 1px solid #AAA;
        height: 1px;
        transition: all 200ms;
      }
      .tick.highlight{
        border-bottom: 2px solid var(--mdc-theme-primary, #46f);
      }
      .header:hover .tick{
        border-bottom: 2px solid var(--mdc-theme-primary, #46f);
      }
      .header:hover{
        color: var(--mdc-theme-primary, #46f);
        cursor: pointer;
      }
      nav:hover{
        width: 200px;
        background: linear-gradient(to right, white, transparent);
        border-left: 4px solid var(--mdc-theme-primary, #46f);
      }
      nav:hover .text{
        opacity: 1;
        margin-left: -17px;
      }
      nav:hover .tick{
        left: -30px;
      }
    `;
  }

  render() {
    const handleClick = (e: Event, header: Header) => {
      const element = document.getElementById(header.id);
      if (!element) {
        return;
      }
      if (history.pushState) {
        history.pushState(null, header.title, `#${header.id}`);
      } else {
        location.hash = `#${header.id}`;
      }
      element.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
    };

    const highlight = (header: Header) => {
      const onScreen = this.#onScreen.has(header.element);
      const lastSeen = this.#lastSeen === header.element;
      return onScreen || (this.#onScreen.size === 0 && lastSeen);
    };

    return html`
      <nav>
        ${this.#headers.map((header, index) => html`
          <div
            class="header"
            @click="${(e: Event) => handleClick(e, header)}"
            style="
              padding-left:calc(28px + ${header.level}px * 7);
            "
            title="${header.title}"
          >
            <div class="tick${highlight(header) ? ' highlight' : ''}" style="width:calc(25px - ${header.level}px*4.5);">&nbsp;</div>
            <div class="text" style="${index === 0 ? 'font-size: 13px;' : ''}">${header.title}</div>
          </div>
        `)}
      </nav>`;
  }
}

export default InkOutline;
