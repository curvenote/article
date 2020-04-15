# Runtime

[![Runtime on npm](https://img.shields.io/npm/v/@iooxa/runtime.svg)](https://www.npmjs.com/package/@iooxa/runtime)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/ink-components/ink-components/blob/master/LICENSE)


The `runtime` package, designed to work with [ink](https://components.ink/), allows you to create variables and components that react to changes in state through **user-defined** functions. The runtime is a small component that can be used in other packages to keep the state of a document reactive.  The package is based on [Redux](https://redux.js.org/) which is compatible with many popular javascript frameworks (e.g. [React](https://reactjs.org/), [Vue](https://vuejs.org/), etc.).

## Getting Started

This package is not setup directly for use in a browser, you can use the [@iooxa/ink-basic](https://www.npmjs.com/package/@iooxa/ink-basic) package to see it in use. For use in other packages, node, etc. you can download the [latest release](https://www.npmjs.com/package/@iooxa/runtime) from NPM:

```bash
>> npm install @iooxa/runtime
```

You should then be able to extend/integrate ink as you see fit:

```javascript
import { createStore, applyMiddleware, combineReducers } from 'redux';
import thunkMiddleware from 'redux-thunk';
import ink, { actions, reducer } from '@iooxa/runtime';

// Create a store
const store = createStore(
  combineReducers({ ink: reducer }),
  applyMiddleware(
    thunkMiddleware,
    ink.triggerEvaluate,
    ink.dangerousEvaluatation,
  ),
);
```

For more information on [Redux](https://redux.js.org/) or [Redux Thunk](https://redux.js.org/advanced/async-actions), please see their docs and tutorials.

## State Structure

The basic state structure is:

```
{
  ink: {
    specs: {…},
    variables: {…},
    components: {…},
  }
}
```

Each of the sub-states, `{…}`, is a dictionary with uuid keys, to an object that represents a variable or a component.

* **specs**: the definition of components, including properties and events. The variable spec is the only component spec included by default.
* **variables**: holds the state of named values (e.g. numbers, strings, etc.), they cannot have events (other than changing the value of the variable)
* **components**: an object that holds the state of a component (e.g. a slider, equation, etc. or more complicated widget). Components have properties that can be defined as functions, as well as named events (e.g. click, change, etc.) that are defined within the spec.

The state **must** be composed inside of an `ink` dictionary. This allows you to compose the ink runtime state inside of your larger application, if required.

## Variables

Variables have a `name` and a `value` and they can also be defined by a function (`func`). Depending on if a function is provided the variable will be `derived`, meaning that the function is used to evaluate the variable and provide the `current` value.

All components and variables also have a `scope` which is used to provide the variables by name when they are evaluated.

To create a variable, create a store and dispatch the createVariable action:

```javascript
const x = store.dispatch(actions.createVariable('myScope.x', null, '1 + 1'));
const y = store.dispatch(actions.createVariable('myScope.y', 1));
```

The name must be a simple variable name, with an optional `scope` prepending the name, the default scope is "global". The value in this case of `x` is null and a function is provided as (`'1 + 1'`) which will be evaluated by the middleware in the `store`.

**Note:** The functions provided are strings and their evaluation can be **dangerous** if you do not trust the source. Read more on the dangers on [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/eval), the runtime package uses a `Function` constructor not `eval`.

### Get and Set Variable Properties

The dispatched action returns a shortcut that can be used to decrease the verbosity of further changes to the variable properties. Note that the current state and the `value` of the variable are often different. The variable is guaranteed to have the `value` only initialization, as other events may change its `current` value.

To get the `current` state of the variable:

```javascript
let current = x.get();
// This can also be accessed through:
current = x.variable.current
```

All of the properties of the variable are contained within the `variable` object that is up to date with the state provided by the `store`.

To change the `value` of the variable, or provide a `func` for evaluation, this can be done through setting the variable:

```javascript
x.set(42)
x.set(null, 'y')
```

In the second line, a function is provided referencing `y`, which will be evaluated as these variables live in the same `scope`.

## Components & Specs

To define a new component you must first define a component spec. This lays out all of the properties that a component has as well as any events it may create.

### Define a Spec

For example, a slider has the following spec:

```javascript
export const SliderSpec = {
  name: 'slider',
  description: 'Range input or a slider!',
  properties: {
    value: { type: PropTypes.number, default: 0 },
    min: { type: PropTypes.number, default: 0 },
    max: { type: PropTypes.number, default: 100 },
    step: { type: PropTypes.number, default: 1 },
  },
  events: {
    change: { args: ['value'] },
  },
};

// Register this component spec
store.dispatch(actions.createComponentSpec(SliderSpec));
```

The slider has a `min`, `max`, `step` and a `value`, when a user drags the slider, it creates a change event function and handler that has a single input to a function called "value" (which is not necessarily related to the `value` property 😕, more on that later.)

The `name` of the spec will need to be referenced when creating components of this type. As such that needs to be registered with the store, shown in the last line of the example above.


### Create a Component

To create a range component, there must be a `spec` defined, and the properties and event handlers of this *instance* of the component can be defined. Note also that this component must live in a `scope`, which allows you to reference variables in that scope by name.

```javascript
const slider = store.dispatch(actions.createComponent(
  'slider', 'scope',
  { value: { func: 'x' }, min: { value: 1 } },
  { change: { func: '{"x": value}' } },
));
```

In this case the current sliders state can be accessed in a few ways:

```javascript
x.get() === slider.state.value
x.get() === slider.component.properties.value.current
```

Here we have created a component that is set up with *two-way-data-binding* to the variable `x`:

1. when `x` changes the `value` property of the slider will also change; and

2. when the slider is interacted with and dispatches a `change` event, that event evaluates the `func`:

  ```javascript
  function onChangeHandler(value) {
    return {"x": value};
  }
  ```

  This dictionary is used to update the variables in the state, and changes the value of `x`.

### Responding to Component Events

As was mentioned before, you do not have to necessarily update the value of the slider (in this case it won’t move) or you may want to update multiple variables at the same time:

```javascript
slider.set({}, { change: { func: '{ x: value, y: value + 1, z: value*2 }' }});
```

This changes the slider component to declare that when a change event happens, update:

* `x = value`
* `y = value + 1`
* `z = value * 2`

Here the function has a single argument called “value” because that is what we defined in the spec:

```javascript
events: {
  change: { args: ['value'] },
},
```

We could change this to any other string or add other required entries for the event. These variable names will overwrite any variables named that in the scope (or globally).

Remember these are **arbitrary** evaluated strings, so you can do anything that Javascript can do. This includes executing user defined functions:

```javascript
function helloSliderInput(value) {
  console.log('The slider is updating to:', value);
  return { x: magicOtherFunction(value) }; // Or no return at all.
}
// Note, it does need to be accessible to the evaluation function!
window.helloSliderInput = helloSliderInput;

slider.set({}, { change: { func: 'helloSliderInput(value)' }});
```

You also have access to other variables in the scope from the evaluated function:

```javascript
// ignore the value from the change event, and just set things to "x":
slider.set({}, { change: { func: 'helloSliderInput(y)' }});
```
