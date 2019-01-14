import { LitElement, html } from '@polymer/lit-element';


class InkOutline extends LitElement {
    static get properties() {
        return {
            headers: Array
        };
    }
    constructor() {
        super();
        // List of objects {level, title, id}:
        // {level: 1, title:'H1 Title', id:'element-id'}
        this.headers = [];
    }
    firstUpdated() {
    }
    _handleClick(e, header){
        var element = document.getElementById(header.id);
        if(!element){
          return;
        }
        // TODO: Put this in the fragment in the URL.
        element.scrollIntoView({behavior:'smooth', block: "start", inline: "nearest"});
    }
    render() {
        return html`
            <style>
              #outline{
                position: fixed;
                top:50vh;
                left:0;
                width: 30px;
                z-index: 100;
                transform: translateY(-50%);
                overflow: hidden;
                transition: all 200ms;
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
              .header:hover .tick{
                border-bottom: 2px solid #F49B32;
              }
              .header:first-of-type{
                text-decoration: underline;
                font-size: 13px;
              }
              .header:hover{
                color: #F49B32;
                cursor: pointer;
              }
              #outline:hover{
                width: 200px;
                background: linear-gradient(to right, white, transparent);
              }
              #outline:hover .text{
                opacity: 1;
                margin-left: -23px;
              }
              #outline:hover .tick{
                left: -30px;
              }
            </style>
            <div id='outline'>
              ${this.headers.map(header => html`
                    <div class="header"
                         @click="${ e=>{this._handleClick(e, header)} }"
                         style="
                                padding-left:calc(28px + ${ header.level }px*5);
                                font-weight: calc(700 - ${ header.level }*100);
                         "
                         title="${ header.title }">
                      <div class="tick" style="width:calc(25px - ${ header.level }px*5);">&nbsp;</div>
                      <div class="text">${ header.title }</div>
                    </div>
              `)}
            </div>
        `;
    }
}

customElements.define('ink-outline', InkOutline);


export { InkOutline };
