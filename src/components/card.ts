import { withRuntime, BaseComponent, html, css } from '@curvenote/components';

function isLinkExternal(url: string) {
  return url && (url.startsWith('http') || url.startsWith('//'));
}

export const CardSpec = {
  name: 'card',
  description: 'Card',
  properties: {},
  events: {},
};

const litProps = {
  url: { type: String },
  imgSrc: { type: String, attribute: 'img-src' },
  author: { type: String },
  date: { type: String },
  description: { type: String },
  contain: { type: Boolean, reflect: true },
};

@withRuntime(CardSpec, litProps)
class Card extends BaseComponent<typeof CardSpec> {
  url = '';

  imgSrc = '';

  author = '';

  date = '';

  description = '';

  contain = false;

  render() {
    return html`
      <div class="card">
        <a
          title="${this.title}"
          href="${this.url}"
          target="${isLinkExternal(this.url) ? '_blank' : '_self'}"
        >
          <div
            class="image"
            style="background-image: url('${this.imgSrc}'); background-size: ${this.contain
              ? 'contain'
              : 'cover'};"
          ></div>
          <time>${this.date}</time>
          <div class="title">${this.title}</div>
          <div class="description">${this.description}</div>
        </a>
      </div>
    `;
  }

  static get styles() {
    return css`
      :host {
        text-align: left;
        display: inline-block;
        padding: 8px;
        width: 200px;
        max-width: 400px;
        margin: 5px;
        flex: 1 auto;
      }
      a {
        text-decoration: none;
      }
      .image {
        background-position: center;
        background-repeat: no-repeat;
        width: 100%;
        height: 0;
        padding-bottom: 50%;
        border: 1px solid #cccccc;
        border-radius: 2px;
      }
      .title {
        font-family: 'Roboto', sans-serif;
        color: #333333;
        font-size: 14px;
        width: calc(100% - 65px);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .card:hover .image {
        border: 1px solid #1e88e5;
      }
      .card:hover .title {
        text-decoration: underline;
      }
      .description {
        font-family: 'Roboto', sans-serif;
        font-size: 10px;
        height: 18px;
        color: #333;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
      time {
        font-size: 12px;
        line-height: 24px;
        color: #aaa;
        font-family: 'Roboto', sans-serif;
        float: right;
      }
    `;
  }
}

export default Card;
