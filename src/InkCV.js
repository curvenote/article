import { LitElement, html } from 'lit-element';
import date from 'date-and-time';
import { SERVER_DATE_FORMAT } from './constants.js';


class CvItem extends LitElement {
    static get properties() {
        return {
            title: String,
            description: String,
            date: String,
            url: String,
        };
    }
    constructor() {
        super();
        this.title = '';
        this.description = '';
        this.date = '';
        this.url = '';
    }
    // setFromSrc(){
    //     fetch('http://localhost:8080' + this.src).then(data =>{
    //         data.json().then(json =>{
    //             this.textContent = json.quote;
    //             this.url = json.url_more;
    //             this.author = json.author;
    //             this.date = json.date.start;
    //         });
    //     });
    // }
    render() {
        var d = this.date;
        if(date.isValid(this.date, SERVER_DATE_FORMAT)){
            d = date.format(date.parse(this.date, SERVER_DATE_FORMAT), 'YYYY');
        }

        return html`
            <style>
              h3{
                margin: 5px 0;
                font-size: 18px;
              }
              #date{
                float: right;
                font-size: 13px;
                margin-top: 8px;
              }
              p{
                color: #333;
                font-size: 12px;
                margin: 0;
                text-align: justify;
              }
              a{
                color: #1E88E5;
                text-decoration: none;
              }
              a:hover{
                text-decoration: underline;
              }
            </style>
            <span id="date">${ this.date }</span>
            <h3>${ this.title }</h3>
            <p>
              ${ this.description }
              ${this.url ? html`<a href="${ this.url }">(See More)</a>` : html``}
            </p>
            <p>
              <slot></slot>
            </p>
      `;
  }
}

customElements.define('cv-item', CvItem);



function formatAmount(amount, brackets){
    if(amount == 0){return '';}
    var numberFormat = new Intl.NumberFormat(
        'en-US',
        {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits:0,
            minimumFractionDigits:0,
        }
    );
    var out = numberFormat.format(amount);
    if(brackets){
        return '(' + out + ')';
    }
    return out;
}

class CvAward extends LitElement {
    static get properties() {
        return {
            title: String,
            description: String,
            date: String,
            url: String,
            amount: Number,
            level: String,
            declined: {type:Boolean, reflect:true},
        };
    }
    constructor() {
        super();
        this.title = '';
        this.description = '';
        this.date = '';
        this.url = '';
        this.amount = 0;
        this.declined = false;
    }
    // setFromSrc(){
    //     fetch('http://localhost:8080' + this.src).then(data =>{
    //         data.json().then(json =>{
    //             this.textContent = json.quote;
    //             this.url = json.url_more;
    //             this.author = json.author;
    //             this.date = json.date.start;
    //         });
    //     });
    // }
    render() {
        var d = this.date;
        if(date.isValid(this.date, SERVER_DATE_FORMAT)){
            d = date.format(date.parse(this.date, SERVER_DATE_FORMAT), 'YYYY');
        }

        return html`
            <style>
              h3{
                margin: 5px 0;
                font-size: 18px;
              }
              #date{
                float: right;
                font-size: 13px;
                margin-top: 8px;
              }
              p{
                color: #333;
                font-size: 12px;
                margin: 0;
                text-align: justify;
              }
              a{
                color: #1E88E5;
                text-decoration: none;
              }
              a:hover{
                text-decoration: underline;
              }
            </style>
            <span id="date">${ this.date }</span>
            <h3>${ this.title }</h3>
            <p>${ this.description }
              ${this.declined ? html`(Declined)` : html``}
              <span id="amount">${ formatAmount(this.amount, true) }</span>
              ${this.url ? html`<a href="${ this.url }">(See More)</a>` : html``}
            </p>
    `;
  }
}

customElements.define('cv-award', CvAward);


export { CvItem, CvAward };
