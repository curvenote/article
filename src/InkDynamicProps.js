import { LitElement, html } from 'lit-element';
import { createDefaultStoreAndIFrame } from './InkScope.js';


function getIFrameFunction(iframe, value, args){
    if(args === undefined){
        args = [];
    }
    return iframe.contentWindow.Function(...args, '"use strict";return ' + value + '');
}


function dispatchUpdates(updates, store){
    let keys = Object.keys(updates);
    for (let i = 0; i < keys.length; i++) {
        const action = {
            type: 'UPDATE_VARIABLE',
            name: keys[i],
            value: updates[keys[i]]
        };
        store.dispatch(action);
    }
}


function getPropDef(self, propName){
    return self.constructor._classProperties.get(propName);
}

function propDef(propName, propType){
    var props = {};
    // noAccessor means you can have children classes defined without re-implementing the setters.
    // https://lit-element.polymer-project.org/guide/properties#accessors
    // If your class does not define accessors for a property, LitElement will generate them, even if a superclass has defined the property or accessors.
    props[propName] = {
        type: String,
        reflect: false,
        _type: propType, // This is getting around LitElement's default parsing.
        noAccessor: true,
    };
    props[propName + 'FunctionString'] = {
        type: String,
        attribute: ':' + propName,
        reflect: true,
        noAccessor: true,
    };
    return props;
}

function getProp(self, propName){

    var propFunc = self[propName + 'Function'];
    var newVal;

    if(propFunc){
        try{
            newVal = propFunc();
            self[propName + 'FunctionError'] = false;
        }catch(err){
            // console.log('Could not evaluate the function', err);
            self[propName + 'FunctionError'] = err.message;
            newVal = Number.NaN;
        }
        self['_' + propName] = newVal;
    }
    return self['_' + propName];
}

function setProp(self, propName, val){
    let oldVal = self['_' + propName];

    if(getPropDef(self, propName)._type !== String && typeof val == 'string'){
        try{
            val = JSON.parse(val);
        }catch(err){
            val = val;
        }
    }

    self['_' + propName] = val;
    // console.log(propName, 'updating ' + propName, val, oldVal);
    self.requestUpdate(propName, oldVal);
}

function getPropFunction(self, propName){

    var functionString = self[propName + 'FunctionString'];
    var derived = !(
        functionString === undefined ||
        functionString === null ||
        functionString === ''
    );

    if(!derived){
        // ensure the function is deleted
        self['_' + propName + 'Function'] = undefined;
        return undefined;
    }
    if (self['_' + propName + 'Function'] === undefined){
        // create the function if it isn't there already
        // console.log(propName, 'Creating function', functionString);
        self['_' + propName + 'Function'] = getIFrameFunction(self.iframe, functionString);
    }

    return self['_' + propName + 'Function'];
}

class BaseGetProps extends LitElement {
    constructor(){
        super();
        this.setDefaults();
    }
    firstUpdated() {
        this.subscribe();
    }
    setDefaults(){
        // none on the base class.
    }
    get store(){
        var closestScope = this.closest('ink-scope');
        if(closestScope === null){
            if(window.store === undefined){
                createDefaultStoreAndIFrame();
            }
            return window.store;
        }else{
            return closestScope.store;
        }
    }
    get iframe(){
        var closestScope = this.closest('ink-scope');
        if(closestScope === null){
            if(window.iframe === undefined){
                createDefaultStoreAndIFrame();
            }
            return window.iframe;
        }else{
            return closestScope.iframe;
        }
    }
    subscribe() {
        if(this.unsubscribe){
            this.unsubscribe();
        }
        this.unsubscribe = this.store.subscribe(() => {
            this.requestUpdate();
        });
    }
    disconnectedCallback(){
        this.unsubscribe();
    }
}

export { BaseGetProps, propDef, getProp, setProp, getPropFunction, dispatchUpdates, getIFrameFunction };
