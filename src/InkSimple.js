import { LitElement, html } from '@polymer/lit-element';
import date from 'date-and-time';
import { SERVER_DATE_FORMAT } from './constants.js';


class InkAside extends LitElement {
    static get properties() {
        return {
        };
    }
    constructor() {
        super();
    }
    firstUpdated() {
    }
    render() {
        return html`
            <style>
              :host .aside{
                float:right;
                position:absolute;
                left: calc(50vw + 385px);
                width: 230px;
                margin-top: -30px;
                font-size: 12px;
                color: #aaa;
                font-family: 'Roboto', sans-serif;
                text-align: left;
              }
              @media screen and (max-width: 1200px) {
                :host .aside{
                  position: static;
                  left: inherit;
                  width: 50%;
                  margin: 15px;
                }
              }
            </style>
            <div class="aside">
              <slot></slot>
            </div>
        `;
    }
}

customElements.define('ink-aside', InkAside);


class InkCallout extends LitElement {
    static get properties() {
        return {
        };
    }
    constructor() {
        super();
    }
    firstUpdated() {
    }
    render() {
        return html`
            <style>
              :host{
                display: block;
                padding: 5px 20px;
                margin: 20px 0;
                border: 1px solid #AAAAAA;
                border-left-width: 5px;
                border-radius: 3px;
                font-size: 14px;
                border-left-color: #4285F4;
              }
              :host(.active) {
                border-left-color: #AAAAAA;
              }
              :host(.success) {
                border-left-color: #40753C;
              }
              :host(.info) {
                border-left-color: #4285F4;
              }
              :host(.warning) {
                border-left-color: #F3B300;
              }
              :host(.danger) {
                border-left-color: #CA4F44;
              }
            </style>
            <slot></slot>
        `;
    }
}

customElements.define('ink-callout', InkCallout);



class InkQuote extends LitElement {
    static get properties() {
        return {
          url: String,
          author: String,
          date: String,
          src: String,
        };
    }
    constructor() {
        super();
        this.url = '';
        this.author = '';
        this.date = '';
        this.src = '';
    }
    setFromSrc(){
        if(!this.src){
            return;
        }
        // TODO: don't load this again if it is the same
        fetch(this.src).then(data =>{
            data.json().then(json =>{
                this.textContent = json.quote;
                this.url = json.url_more;
                this.author = json.author;
                this.date = json.date.start;
            });
        });
    }
    updated(changedProperties) {
        changedProperties.forEach((oldValue, propName) => {
            switch (propName) {
                case 'src':
                    return this.setFromSrc();
                default:
                  return;
            }
        });
    }
    render() {
        var d = '';
        if(date.isValid(this.date, SERVER_DATE_FORMAT)){
            d = date.format(date.parse(this.date, SERVER_DATE_FORMAT), 'MMMM YYYY');
        }

        return html`
            <style>
                a {
                    color: #1E88E5;
                    text-decoration: none;
                    font-weight: 500;
                }
                a:hover{
                    text-decoration: underline;
                }
                blockquote{
                    padding: 10px 20px;
                    margin: 20px 0;
                    border-left: 5px solid #eee;
                    color: #31708f;
                    font-size: 17.5px;
                    font-weight: 300;
                    line-height: 1.25;
                    text-align: justify;
                }
                div{
                    margin-top: 10px;
                    text-align: right;
                    font-style: italic;
                }
              </style>
              <blockquote>
                  <slot></slot>
                  <div>${ this.url ?
                    html`<a href="${ this.url }" target="_blank">${ this.author }</a>` :
                    html`${ this.author }` }, ${ d }</div>
              </blockquote>
      `;
  }
}

customElements.define('ink-quote', InkQuote);


class InkCard extends LitElement {
    static get properties() {
        return {
            title: String,
            description: String,
            imgSrc: {type:String, attribute:'img-src'},
            url: String,
            date: String,
            width: String,
        };
    }
    constructor() {
        super();
        this.url = '';
        this.author = '';
        this.date = '';
        this.src = '';
        this.width = null;
    }
    // setFromSrc(){
    //     fetch(this.src).then(data =>{
    //         data.json().then(json =>{
    //             this.textContent = json.quote;
    //             this.url = json.url_more;
    //             this.author = json.author;
    //             this.date = json.date.start;
    //         });
    //     });
    // }
    render() {
        var d = '';
        if(date.isValid(this.date, SERVER_DATE_FORMAT)){
            d = date.format(date.parse(this.date, SERVER_DATE_FORMAT), 'YYYY');
        }

        return html`
            <style>
              .card{
                display: inline-block;
                width: ${ this.width || '200px'};
                height: 0;
                margin: 15px;
                position: relative;
                cursor: pointer;
                text-decoration: none;
              }
              .image{
                background-size: cover;
                background-position: center;
                background-repeat: no-repeat;
                width: 100%;
                height: 0;
                padding-bottom: 50%;
                border: 1px solid #CCCCCC;
                border-radius: 2px;
              }
              .title{
                font-family: 'Roboto', sans-serif;
                color: #333333;
                font-size: 14px;
                width: calc(100% - 65px);
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
              }
              .card:hover .image{
                border: 1px solid #1E88E5;
              }
              .card:hover .title{
                text-decoration: underline;
              }
              .description{
                font-family: 'Roboto', sans-serif;
                font-size: 10px;
                height: 18px;
                color: #333;
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
              }
              .date{
                font-size: 12px;
                line-height: 24px;
                color: #aaa;
                font-family: 'Roboto', sans-serif;
                float: right;
              }
            </style>
            <a class="card" title="${ this.title }" href="${ this.url }">
              <div class="image" style="background-image: url('${ this.imgSrc }')"></div>
              <div class="date">${ this.date }</div>
              <div class="title">${ this.title }</div>
              <div class="description">${ this.description }</div>
            </a>
      `;
  }
}

customElements.define('ink-card', InkCard);


class H2More extends LitElement {
    static get properties() {
        return {
            url: String,
        };
    }
    constructor() {
        super();
        this.url = '';
    }
    render() {
        return html`
          <style>
            div{
              position: relative;
            }
            h2{
              font-family: 'Roboto', sans-serif;
              margin: 0;
              color: #333333;
              font-weight: 500;
            }
            a.button{
              font-family: "Roboto", sans-serif;
              border: 1px solid #CCCCCC;
              border-radius: 2px;
              position: absolute;
              padding: 0 8px;
              top: 11px;
              right: 0px;
              font-size: 13px;
              cursor: pointer;
              color: #333333;
            }
            a.button:hover{
              text-decoration: underline;
              border: 1px solid #1E88E5;
            }
          </style>
          <div>
              <h2><slot></slot></h2>
              ${this.url ? html`<a href="${ this.url }" class="button">See More</a>` : html``}
          </div>
        `;
  }
}

customElements.define('h2-more', H2More);



class InkByline extends LitElement {
    static get properties() {
        return {
            date: String,
            authors: Object,
        };
    }
    constructor() {
        super();
        this.date = '';
        this.authors = [];
    }
    render() {

        var d = this.date;
        if(date.isValid(this.date, SERVER_DATE_FORMAT)){
            d = date.format(date.parse(this.date, SERVER_DATE_FORMAT), 'MMMM DD, YYYY');
        }

        var authors = this.authors
        if(typeof(authors) == "string"){
            authors = JSON.parse(authors);
        }

        return html`
          <style>
            .byline{
              margin-right: -10px;
              margin-top: -20px;
              color:#9A9A9A;
              min-height: 50px;
            }
            .date{
              text-align: left;
              float: left;
              font-size: 15px;
              font-style: italic;
            }
            .authors{
              text-align: right;
            }
            .author{
              width: 120px;
              margin: 5px;
              overflow: hidden;
              display: inline-block;
            }
            .author > .name{
              height: 25px;
              margin-top: -5px;
              font-size: 15px;
              width: 110px;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
              text-align: right;
            }
          </style>
          <div class='byline'>
            <div class="date">${ d }</div>
            <div class="authors">
              ${authors.map(author => html`
                <div class="author">
                  <div class="name">
                    ${ author.name }
                  </div>
                </div>
              `)}
            </div>
          </div>
        `;
  }
}

customElements.define('ink-byline', InkByline);




export { InkAside, InkCallout, InkQuote, InkCard, H2More, InkByline };
