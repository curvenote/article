import { LitElement, html } from '@polymer/lit-element';


function getIFrameFunction(iframe, value, args){
    if(args === undefined){
        args = [];
    }
    return iframe.contentWindow.Function(...args, '"use strict";return ' + value + '');
}


function getPropDef(self, propName){
    return self.constructor._classProperties.get(propName)
}

function propDef(propName, propType){
    var props = {};
    props[propName] = {
        type: String,
        reflect: false,
        _type: propType, // This is getting around LitElement's default parsing.
    };
    props[propName + 'FunctionString'] = {
        type: String,
        attribute: ':' + propName,
        reflect: true,
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
        // try it...
        val = JSON.parse(val);
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
    if(self._xlimFunction === undefined){
        // create the function if it isn't there already
        // console.log(propName, 'Creating function', functionString);
        self['_' + propName + 'Function'] = getIFrameFunction(self.iframe, functionString);
    }

    return self['_' + propName + 'Function'];
}

class BaseGetProps extends LitElement {
    firstUpdated() {
        this.subscribe();
    }
    get store(){
        var closestScope = this.closest('ink-scope');
        if(closestScope === null){
            return window.store;
        }else{
            return closestScope.store;
        }
    }
    get iframe(){
        var closestScope = this.closest('ink-scope');
        if(closestScope === null){
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
    constructor(){
        super();
        this.setDefaults();
    }
}

export { BaseGetProps, propDef, getProp, setProp, getPropFunction, getIFrameFunction };
