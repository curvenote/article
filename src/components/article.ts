import { renderHTML } from '@iooxa/components';
import scrollIntoView from 'scroll-into-view-if-needed';
import { katexCSS } from './equation';
import { title2name } from './utils';

const renderMathInElement = require('katex/contrib/auto-render/auto-render.js').default;

const MATH_RENDER_OPTIONS = {
  delimiters: [
    { left: '$$', right: '$$', display: true },
    { left: '\\[', right: '\\]', display: true },
    { left: '$', right: '$', display: false },
    { left: '\\(', right: '\\)', display: false },
  ],
  ignoredTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code', 'r-code'],
};

export function renderMath(element: Element) {
  renderMathInElement(element, MATH_RENDER_OPTIONS);
}

export function setupNav() {
  Array.from(
    document.querySelectorAll('nav .section div'),
  ).forEach((sec: Element) => {
    sec.addEventListener('click', () => sec.parentElement?.classList.toggle('open'));
  });

  const header = document.querySelectorAll('nav > div')?.[0];
  header?.addEventListener('click', () => {
    if (window.innerWidth < 1500) {
      header.parentElement?.classList.toggle('open');
    }
  });
  const article = document.querySelectorAll('article')?.[0];
  article?.addEventListener('click', () => {
    header.parentElement?.classList.remove('open');
  });
}

export function gotoHash() {
  const headers = document.querySelectorAll('H1, H2, H3, H4, H5, H6');
  const hash = window.location.hash.slice(1);
  if (headers == null || headers.length <= 1 || hash.length === 0) return;

  headers.forEach((header) => {
    if (header.getAttribute('data-outline') === 'none') return;
    const id = header.id || title2name(header.textContent ?? '');
    if (id === hash) {
      scrollIntoView(header, { behavior: 'smooth', block: 'center', inline: 'nearest' });
    }
  });
}

export default function setup() {
  const katexFragment = document.createDocumentFragment();
  renderHTML(katexCSS, katexFragment);
  document.head.appendChild(katexFragment);
  Array.from(
    document.querySelectorAll('article'),
  ).forEach((element) => renderMath(element));
  setupNav();
  // This should give the code enough time to render
  setTimeout(gotoHash, 250);
}
