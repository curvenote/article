# Ink Components

The goal of ink.js is to provide web-components for interactive scientific writing, reactive documents and explorable explanations.
Included in `ink.js` are ways to create, update and display variables as text, equations and charts.

ink.js is heavily inspired by [tangle.js](http://worrydream.com/Tangle/guide.html), re-imagined to use [web-components](https://www.webcomponents.org/)!
This means you can declaratively write your variables and how to display them in `html` markup.
To get an idea of what that looks like, let's take the canonical example of Tangled Cookies - a simple reactive document.

![How many calories in that cookie?](images/tangle.gif)

```html
<ink-var name="cookies" value="3" format=".4"></ink-var>
<ink-var name="caloriesPerCookie" value="50"></ink-var>
<ink-var name="dailyCalories" value="2100"></ink-var>

<ink-var name="calories" :value="cookies * caloriesPerCookie" format=".0f"></ink-var>
<ink-var name="dailyPercent" :value="calories / dailyCalories" format=".0%"></ink-var>

<p>
    When you eat <ink-dynamic name="cookies" min="2" max="100"> cookies</ink-dynamic>,
    you consume <ink-display name="calories">150</ink-display> calories.<br>
    That's <ink-display name="dailyPercent">7%</ink-display> of your recommended daily calories.
</p>
```

## Components

https://www.webcomponents.org/element/ink-components/elements/cv-award

* Variables, actions and displays
    * ink-scope
    * ink-var
    * ink-varList
    * ink-display
    * ink-range
    * ink-dynamic
    * ink-button
    * ink-action
* Charts
    * ink-chart
    * ink-chartCircle
    * ink-chartPath
    * ink-chartText
    * ink-chartNode
    * ink-chartEqn
* Simple layout
    * ink-article
    * ink-equation
    * ink-figure
    * ink-code
    * ink-outline
    * ink-aside
    * ink-callout
    * ink-quote
    * ink-card
    * ink-byline
    * h2-more
    * ink-span
    * ink-p
    * ink-div
* Resume elements
    * cv-item
    * cv-award


## Getting Started

Ink is based on web components, which create custom HTML tags so that they can make writing documents easier.
To get started, copy the built javascript file to the head of your page:

```html
<script src="https://unpkg.com/ink-components"></script>
```

You can also download the latest release from GitHub. If you are running this without a web server, ensure the script has `charset="utf-8"` in the script tag. You can also install from npm:

```bash
>> npm install ink-components
```

You should then be able to extend ink as you see fit:

```javascript
import * as ink from 'ink-components';
```
