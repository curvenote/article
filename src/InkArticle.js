import { render } from 'lit-html';
import { LitElement, html } from 'lit-element';
import katex from 'katex';
import renderMathInElement from 'katex/contrib/auto-render/auto-render.js';
import { katexCSS, bricksTheme } from './styles.js';


var MATH_RENDER_OPTIONS = {
    delimiters: [
        {left: "$$", right: "$$", display: true},
        {left: "\\[", right: "\\]", display: true},
        {left: "$", right: "$", display: false},
        {left: "\\(", right: "\\)", display: false}
    ],
    ignoredTags: ["script", "noscript", "style", "textarea", "pre", "code", "ink-code"]
};



class InkArticle extends LitElement {
    static get properties() {
        return {
            headers: Object
        };
    }
    constructor() {
        super();
        this.headers = [];

        // This injects the css link into the head
        var katexFragment = document.createDocumentFragment();
        render(katexCSS, katexFragment);
        document.head.appendChild(katexFragment);
        var bricksFragment = document.createDocumentFragment();
        render(bricksTheme, bricksFragment);
        document.head.appendChild(bricksFragment);
    }
    firstUpdated() {
        setTimeout( () =>{
            this.renderMath();
            this.renderOutline();
        }, 500);
    }
    renderMath() {
        // This is necessary to render inline math for firefox.
        // <slot>s are treated differently.
        renderMathInElement(this, MATH_RENDER_OPTIONS);
    }
    renderOutline() {
        var headers = this.querySelectorAll('H1, H2, H3, H4, H5, H6, H2-MORE');
        if(headers.length < 3){
            // No need for an outline!
            this.headers = [];
            return;
        }
        var data = [];
        for (var i = 0; i < headers.length; i++) {
            var id = headers[i].textContent.toLowerCase().replace(/ /g, '-').replace(/\W-/g, '');
            headers[i].id = id;
            data.push({
                id: id,
                level: parseInt(headers[i].tagName[1])-1,
                title: headers[i].textContent,
            });
        };
        this.headers = data;
    }
    render() {
        return html`
            <style>
              .content, ::slotted(p) {
                display: block;
                font-size: 17px;
                line-height: 1.8;
                margin-top: 20px;
                margin-bottom: 20px;
                color: #4D4D4D;
                font-family: 'Roboto', sans-serif;
                font-weight: 300;
              }

              ::slotted(hr) {
                width: 100vw;
                margin-top: 30px;
                margin-bottom: 30px;
                margin-left: calc(-50vw + 342px);
                border-top: 1px solid #B2B2B2;
                border-bottom: none;
                border-left: none;
                border-right: none;
              }

              ::slotted(hr.small) {
                width: 200px;
                margin-left: calc(50% - 100px);
              }

              .content {
                max-width: 700px;
                margin-top: 90px;
                margin-left: calc(50vw - 350px);
              }

              @media screen and (max-width: 710px) {
                .content {
                  margin-left: 10px;
                }
                ::slotted(hr) {
                  width: calc(100vw);
                  margin-left: -18px;
                }
                ::slotted(hr.small) {
                  width: 200px;
                  margin-left: calc(50% - 100px);
                }
              }
              @media screen and (max-width: 1000px) {
                #outline{
                  display: none;
                }
              }
            </style>
            <div class="content">
              <slot></slot>
              <ink-bibliography id="bibliography"></ink-bibliography>
              <ink-outline .headers="${ this.headers }"></ink-outline>
            </div>
        `;
    }
}

customElements.define('ink-article', InkArticle);


export { InkArticle };
