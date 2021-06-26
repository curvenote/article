import { renderHTML } from '@curvenote/components';
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

export function setupNav() {
  Array.from(document.querySelectorAll('nav .section div')).forEach((sec: Element) => {
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

export default function setup() {
  const katexFragment = document.createDocumentFragment();
  renderHTML(katexCSS, katexFragment);
  document.head.appendChild(katexFragment);
  Array.from(document.querySelectorAll('article')).forEach((element) => renderMath(element));
  setupNav();
}
