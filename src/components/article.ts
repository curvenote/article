import { renderHTML } from '@iooxa/components';
import { katexCSS } from './equation';

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

export function setupOutline() {
  Array.from(
    document.querySelectorAll('nav .section div'),
  ).forEach((sec: Element) => {
    sec.addEventListener('click', () => sec.parentElement?.classList.toggle('open'));
  });
}

export default function setup() {
  const katexFragment = document.createDocumentFragment();
  renderHTML(katexCSS, katexFragment);
  document.head.appendChild(katexFragment);
  Array.from(
    document.querySelectorAll('article'),
  ).forEach((element) => renderMath(element));
  setupOutline();
}
