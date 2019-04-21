import { LitElement, html } from 'lit-element';


class InkFigure extends LitElement {
    static get properties() {
        return {
          /** Source of the figure image */
          imgSrc: {
            type: String,
            attribute: "img-src"
          },
          /** Number of the figure, typically added by an enclosing article */
          number: {
            type: Number
          },
          /** If the figure is labeled or not*/
          labeled: {
            type: Boolean
          }
        };
    }
    constructor() {
        super();
        this.labeled = false;
    }
    firstUpdated() {
    }
    render() {
        return html`
            <style>
              :host {
                display: block;
              }
              :host img{
                margin: 15px 15px 0px 15px;
                width: calc(100% - 30px);
                max-width: 800px;
              }
              :host .caption{
                color: #aaa;
                font-family: 'Roboto', sans-serif;
                text-align: center;
                margin: 0px 10px 10px 10px;
                font-size: 0.9em;
              }
              :host .caption .label{
                font-weight: bold;
              }
            </style>
            <img src="${ this.imgSrc }">
            <div class="caption">
              <span ?hidden="${ !this.labeled }" class="label">Figure ${ this.number }:</span>
              <slot></slot>
            </div>
        `;
    }
}

customElements.define('ink-figure', InkFigure);


export { InkFigure };
