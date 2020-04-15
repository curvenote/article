# @iooxa/ink-article

[![Ink-Basic on npm](https://img.shields.io/npm/v/@iooxa/ink-article.svg)](https://www.npmjs.com/package/@iooxa/ink-article)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/iooxa/ink-article/blob/master/LICENSE)

The goal of `ink-article` is to provide web-components for interactive scientific writing, reactive documents and [explorable explanations](https://explorabl.es). This library provides the layout and scientific specific parts of [ink-components](https://components.ink) including ways equations, asides.

The [ink-components](https://components.ink) project is heavily inspired by [tangle.js](http://worrydream.com/Tangle/guide.html), re-imagined to use [web-components](https://www.webcomponents.org/)!
This means you can declaratively write your variables and how to display them in `html` markup.
To get an idea of what that looks like, let's take the canonical example of *Tangled Cookies* - a simple reactive document.

![How many calories in that cookie?](images/tangle.gif)

```html
<ink-var name="cookies" value="3" format=".4"></ink-var>
<ink-var name="caloriesPerCookie" value="50"></ink-var>
<ink-var name="dailyCalories" value="2100"></ink-var>

<ink-var name="calories" :value="cookies * caloriesPerCookie" format=".0f"></ink-var>
<ink-var name="dailyPercent" :value="calories / dailyCalories" format=".0%"></ink-var>

<p>
  When you eat <ink-dynamic bind="cookies" min="2" max="100">cookies</ink-dynamic>,
  you consume <ink-display bind="calories"></ink-display> calories.<br>
  That's <ink-display bind="dailyPercent"></ink-display> of your recommended daily calories.
</p>
```

## Getting Started

Ink is based on web-components, which creates custom HTML tags so that they can make writing documents easier.
To get started, copy the built javascript file to the head of your page:

```html
<script src="https://unpkg.com/@iooxa/ink-article"></script>
```

You can also download the [latest release](https://github.com/iooxa/ink-article/releases) from GitHub. If you are running this without a web server, ensure the script has `charset="utf-8"` in the script tag. You can also [install from npm](https://www.npmjs.com/package/@iooxa/ink-article):

```bash
>> npm install @iooxa/ink-article
```

You should then be able to extend ink as you see fit:

```javascript
import components from '@iooxa/ink-article';
```

Note that the npm module does not setup the [@iooxa/runtime](https://github.com/iooxa/runtime) store, nor does it register the components. See the [ink.ts](/ink.ts) file for what the built package does to `setup` the store and `register` the components.
