// import _ from 'lodash';
// import './style.css';
// import Icon from './icon.png';
// import printMe from './print.js';
// import { cube } from './math.js';


// import { LitElement, html } from '@polymer/lit-element';
// import {unsafeHTML} from 'lit-html/directives/unsafe-html.js';


import { InkArticle } from './InkArticle.js';
import { InkOutline } from './InkOutline.js';
import { InkFigure } from './InkFigure.js';
import { InkCode } from './InkCode.js';
import { InkEquation } from './InkEquation.js';
import { InkAside, InkCallout, InkQuote, InkCard, H2More, InkByline } from './InkSimple.js';
import { CvItem, CvAward } from './InkCV.js';


export {
    InkArticle,
    InkOutline,
    InkFigure,
    InkCode,
    InkEquation,
    InkAside,
    InkCallout,
    InkQuote,
    InkCard,
    H2More,
    InkByline,
    CvItem,
    CvAward,
}

// function component() {
//   let element = document.createElement('div');

//   element.innerHTML = _.join(['Hello', 'rowan', '5 cubed is equal to ' + cube(5)], ' ');
//   element.classList.add('hello');
//   var btn = document.createElement('button');


//   // Add the image to our existing div.
//   var myIcon = new Image();
//   myIcon.src = Icon;

//   element.appendChild(myIcon);


//   btn.innerHTML = 'Click me and check the console!';
//   btn.onclick = printMe;
//   element.appendChild(btn);

//   return element;
// }

// document.body.appendChild(component());


// class MyElement extends LitElement {
//   static get properties() {
//     return {
//       prop1: String,
//       prop2: String,
//       prop3: { type: Boolean, reflect: true },
//       prop4: String
//     };
//   }
//   constructor() {
//     super();
//     this.prop1 = 'text binding';
//     this.prop2 = 'mydiv';
//     this.prop3 = true;
//     this.prop4 = 'pie';
//   }
//   render() {
//     return html`
//       <!-- text binding -->
//       <div>${this.prop1}</div>

//       <!-- attribute binding -->
//       <div id="${this.prop2}">attribute binding</div>

//       <!-- boolean attribute binding -->
//       <div>
//         boolean attribute binding
//         <input type="checkbox" ?checked="${this.prop3}" @change="${this.toggle}"/>
//       </div>

//       <!-- property binding -->
//       <div>
//         property binding
//         <input type="checkbox" .value="${this.prop4}" .checked="${this.prop3}"/>
//       </div>

//       <!-- event handler binding -->
//       <div>event handler binding
//         <button @click="${this.clickHandler}">click</button>
//       </div>
//     `;
//   }
//   clickHandler(e) {
//       console.log(e.target);
//   }
//   toggle(e){
//       console.log(e);
//       this.prop3 = e.target.checked;
//     // this.loadLazy();
//   }
//   updated(changedProperties) {
//     changedProperties.forEach((oldValue, propName) => {
//       console.log(`${propName} changed. oldValue: ${oldValue}`);
//     });
//   }
// }

// customElements.define('my-element', MyElement);





// import { combineReducers, createStore } from 'redux'

// // Reducer
// function variables(state, action) {
//   switch (action.type) {
//     case 'UPDATE_VARIABLE':
//       var newState = {
//           ...state
//       };
//       newState[action.variable] = action.value;
//       return newState;
//     default:
//       return {};
//   }
// }

// // These should be added inside of a container element
// const reducer = combineReducers({ variables });
// const store = createStore(reducer);

// window.store = store;


// class InkRange extends LitElement {
//     static get properties() {
//         return {
//             bind: { type: String, reflect: true },
//             value: { type: Number, reflect: true },
//         };
//     }
//     constructor() {
//         super();
//         this.bind = null;
//         this.value = 0;
//     }
//     render() {
//         return html`<input type="range" min="1" max="4" .value="${this.value}" @change="${this._changeHandler} @input="${this._changeHandler}">`;
//     }
//     subscribe() {
//         if(this.unsubscribe){
//             this.unsubscribe();
//         }
//         this.unsubscribe = store.subscribe(() => {
//           this.value = store.getState().variables[this.bind];
//         });
//     }
//     firstUpdated() {
//         this.subscribe();
//     }
//     _changeHandler(e) {
//         this.value = Number.parseFloat(e.target.value);
//     }
//     updated(changedProperties) {
//         changedProperties.forEach((oldValue, propName) => {
//             switch (propName) {
//                 case 'value':
//                     return store.dispatch({
//                         type: 'UPDATE_VARIABLE',
//                         variable: this.bind,
//                         value: this.value,
//                     });
//                 case 'bind':
//                     // Check if the bound variable is legit
//                     this.subscribe();
//                     this.value = store.getState().variables[this.bind];
//                     return;
//                 default:
//                   return;
//             }
//         });
//     }
// }

// customElements.define('ink-range', InkRange);



// class InkDisplay extends LitElement {
//     static get properties() {
//         return {
//             bind: { type: String, reflect: true },
//             value: { type: Number, reflect: true },
//         };
//     }
//     constructor() {
//         super();
//         this.bind = null;
//         this.value = 0;
//     }
//     render() {
//         return html`<span>${this.value}</span>`;
//     }
//     subscribe() {
//         if(this.unsubscribe){
//             this.unsubscribe();
//         }
//         this.unsubscribe = store.subscribe(() => {
//           this.value = store.getState().variables[this.bind];
//         });
//     }
//     firstUpdated() {
//         this.subscribe();
//     }
//     updated(changedProperties) {
//         changedProperties.forEach((oldValue, propName) => {
//             switch (propName) {
//                 case 'bind':
//                     // Check if the bound variable is legit
//                     this.subscribe();
//                     this.value = store.getState().variables[this.bind];
//                     return;
//                 default:
//                   return;
//             }
//         });
//     }
// }

// customElements.define('ink-display', InkDisplay);


// class InkDerived extends LitElement {
//     static get properties() {
//         return {
//             name: String,
//             value: Number,
//         };
//     }
//     constructor() {
//         super();
//         this.name = 'temp';
//         this.value = 0;
//     }
//     render() {
//         return html`<span>${this.value}</span>`;
//     }
//     firstUpdated() {
//         store.subscribe(() => {
//           this.value = store.getState().variables[this.bind];
//         });
//     }
// }

// customElements.define('ink-derived', InkDerived);

