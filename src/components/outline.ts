import {
  BaseComponent, withRuntime, html, css, throttle, THROTTLE_SKIP,
} from '@curvenote/components';
import scrollIntoView from 'scroll-into-view-if-needed';
import { title2name } from './utils';

export const OutlineSpec = {
  name: 'outline',
  description: 'Outline',
  properties: {},
  events: {},
};

const litProps = {
  for: { type: String, reflect: true },
  open: { type: Boolean, reflect: true },
};

interface Header {
  id: string;
  level: number;
  title: string;
  element: HTMLHeadingElement;
}

const handleClick = (header: Header) => {
  if (!header.element) return;
  if (window.history.replaceState) {
    window.history.replaceState(null, header.title, `#${header.id}`);
  } else {
    window.location.hash = `#${header.id}`;
  }
  scrollIntoView(header.element, { behavior: 'smooth', block: 'center', inline: 'nearest' });
};

@withRuntime(OutlineSpec, litProps)
class Outline extends BaseComponent<typeof OutlineSpec> {
  open = false;

  #headers: Header[] = [];

  #outlineTarget: Element | null = null;

  #lastSeen: Element | null = null;

  #onScreen: Set<Element> = new Set();

  #intersectionObserver: IntersectionObserver | undefined;

  #headerUnsubscribe: (()=>void)[] = [];

  createOutline() {
    const headers: NodeListOf<HTMLHeadingElement> | undefined = this.#outlineTarget?.querySelectorAll('H1, H2, H3, H4, H5, H6');

    if (headers == null || headers.length <= 1) {
      this.#headers = [];
      return;
    }

    this.#intersectionObserver?.disconnect();
    this.#headerUnsubscribe.forEach((func) => func());
    this.#headerUnsubscribe = [];
    this.#intersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        this.#onScreen[entry.isIntersecting ? 'add' : 'delete'](entry.target);
        if (!entry.isIntersecting) this.#lastSeen = entry.target;
      });
      this.requestUpdate();
    }, { threshold: [0] });

    const headerData: Header[] = [];
    headers.forEach((header) => {
      if (header.getAttribute('data-outline') === 'none') return;
      const id = header.id || title2name(header.textContent ?? '');
      const data = {
        id,
        level: parseInt(header.tagName[1], 10) - 1,
        title: header.textContent ?? '',
        element: header,
      };
      headerData.push(data);
      // const func = () => handleClick(data);
      // header.addEventListener('click', func);
      // this.#headerUnsubscribe.push(() => header.removeEventListener('click', func));
    });
    // If there are not enough, don't show it.
    this.#headers = headerData.length <= 1 ? [] : headerData;
    headerData.forEach(({ element }) => this.#intersectionObserver?.observe(element));
    this.requestUpdate();
  }

  firstUpdated() {
    const element = document.getElementById((this as any).for) ?? document.querySelectorAll('article')?.[0];
    if (element == null) {
      // eslint-disable-next-line no-console
      console.warn(`r-outline: No <article>, or element was found for ID="${(this as any).for}"`);
      return;
    }
    this.#outlineTarget = element;
    const mutations = new MutationObserver(throttle(() => this.createOutline(), THROTTLE_SKIP));
    mutations.observe(element, { attributes: true, childList: true, subtree: true });
    this.createOutline();
  }

  static get styles() {
    return css`
    :host {
      display: block;
    }
    :host:hover{
      z-index: 100;
    }
    nav{
      width: 30px;
      overflow: hidden;
      transition: all 200ms;
      user-select: none;
      box-shadow: rgba(0, 0, 0, 0.1) 6px 0px 5px -7px inset;
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
      font-family: var(--curvenote-font, sans-serif);
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
    .header:hover{
      color: var(--mdc-theme-primary, #46f);
      cursor: pointer;
    }
    .open, nav:hover{
      width: 200px;
      background: linear-gradient(to right, white, transparent);
      border-left: 4px solid var(--mdc-theme-primary, #46f);
    }
    .open .text, nav:hover .text{
      opacity: 1;
      margin-left: -17px;
    }
    .open .tick, nav:hover .tick{
      left: -30px;
    }
    `;
  }

  render() {
    if (this.getAttribute('open') === 'false') {
      this.open = false;
    }
    if (this.#headers.length <= 1) return html``;

    const highlight = (header: Header) => {
      const onScreen = this.#onScreen.has(header.element);
      const lastSeen = this.#lastSeen === header.element;
      return onScreen || (this.#onScreen.size === 0 && lastSeen);
    };

    const popOpen = this.#onScreen.has(this.#headers[0].element) || this.open;

    return html`
      <nav class="${popOpen ? 'open' : ''}">
        ${this.#headers.map((header, index) => html`
          <div
            class="header"
            @click="${() => handleClick(header)}"
            style="padding-left:calc(28px + ${header.level}px * 7);"
            title="${header.title}"
          >
            <div class="tick${highlight(header) ? ' highlight' : ''}" style="width:calc(25px - ${header.level}px*4.5);"></div>
            <div class="text" style="${index === 0 ? 'font-size: 13px;' : ''}">${index === 0 ? 'Contents' : header.title}</div>
          </div>
        `)}
      </nav>`;
  }
}

export default Outline;
