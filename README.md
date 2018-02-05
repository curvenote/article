# Ink - Scientific web components

Ink is a collection of web-components for scientific publishing - the standard equations, figures, and code. The idea of `ink` is to provide an easy to use article layout that lays a foundation for interactive documents.

For example, the `ink-equation` class provides a `eqn.math` property that can easily be set when things change:

![Taylor Series](/images/taylor-series.gif)

## Installing from source

Ink uses [Polymer 2.0](https://www.polymer-project.org/) so if you are more familiar with the `polymer-cli` you can use that, if not, take a look at the `Makefile`.

```
$ git clone git@github.com:rowanc1/ink.git
$ cd ink
$ make install
$ make serve
```
