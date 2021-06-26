<p align="center"><a href="https://curvenote.dev"><img src="https://curvenote.dev/images/logo.png" alt="curvenote.dev" width="150"></a></p>

# @curvenote/article

[![curvenote/article on npm](https://img.shields.io/npm/v/@curvenote/article.svg)](https://www.npmjs.com/package/@curvenote/article)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/curvenote/article/blob/master/LICENSE)
[![Documentation](https://img.shields.io/badge/curvenote.dev-Docs-green)](https://curvenote.dev)

The goal of `@curvenote/article` is to provide web-components for interactive scientific writing, reactive documents and [explorable explanations](https://explorabl.es). `@curvenote/article` provides reactive components, equations, and charts as well as layouts for creating interactive scientific articles.

The [curvenote/article](https://curvenote.dev/article) project is heavily inspired by [tangle.js](http://worrydream.com/Tangle/guide.html), re-imagined to use [web-components](https://www.webcomponents.org/)!
This means you can declaratively write your variables and how to display them in `html` markup.
To get an idea of what that looks like, let's take the canonical example of _Tangled Cookies_ - a simple reactive document.

![How many calories in that cookie?](images/tangle.gif)

```html
<r-var name="cookies" value="3" format=".4"></r-var>
<r-var name="caloriesPerCookie" value="50"></r-var>
<r-var name="dailyCalories" value="2100"></r-var>

<r-var name="calories" :value="cookies * caloriesPerCookie" format=".0f"></r-var>
<r-var name="dailyPercent" :value="calories / dailyCalories" format=".0%"></r-var>

<p>
  When you eat <r-dynamic bind="cookies" min="2" max="100">cookies</r-dynamic>, you consume
  <r-display bind="calories"></r-display> calories.<br />
  That's <r-display bind="dailyPercent"></r-display> of your recommended daily calories.
</p>
```

## Getting Started

`@curvenote/article` is based on web-components, which creates custom HTML tags so that they can make writing documents easier.
To get started, copy the built javascript file to the head of your page:

```html
<link rel="stylesheet" href="https://unpkg.com/@curvenote/article/dist/curvenote.css" />
<script async src="https://unpkg.com/@curvenote/article"></script>
```

You can also download the [latest release](https://github.com/curvenote/article/releases) from GitHub. If you are running this without a web server, ensure the script has `charset="utf-8"` in the script tag. You can also [install from npm](https://www.npmjs.com/package/@curvenote/article):

```bash
>> npm install @curvenote/article
```

You should then be able to extend the package as you see fit:

```javascript
import components from '@curvenote/article';
```

Note that the npm module does not setup the [@curvenote/runtime](https://github.com/curvenote/runtime) store, nor does it register the components. See the [curvenote.ts](/curvenote.ts) file for what the built package does to `setup` the store and `register` the components.

## Documentation

See https://curvenote.dev for full documentation.
