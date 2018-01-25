# react-switch-card-module
---

switch card for react module

[![build status][travis-image]][travis-url]
[![NPM version][npm-image]][npm-url]
[![Test coverage][coveralls-image]][coveralls-url]
[![npm download][download-image]][download-url]

[travis-image]: https://travis-ci.org/nvsky/react-switch-card-module.svg?style=flat-square
[travis-url]: https://travis-ci.org/nvsky/react-switch-card-module
[npm-image]: https://img.shields.io/npm/v/react-switch-card-module.svg?style=flat-square
[npm-url]: http://npmjs.org/package/react-switch-card-module
[coveralls-image]: https://coveralls.io/repos/github/nvsky/react-switch-card-module/badge.svg?style=flat-square
[coveralls-url]: https://coveralls.io/github/nvsky/react-switch-card-module?branch=master
[download-image]: https://img.shields.io/npm/dm/react-switch-card-module.svg?style=flat-square
[download-url]: https://npmjs.org/package/react-switch-card-module

## install

[![react-switch-card-module](https://nodei.co/npm/react-switch-card-module.png)](https://npmjs.org/package/react-switch-card-module)

## Usage

```js
var SwitchCard = require('react-switch-card-module');
var React = require('react');
React.render(<SwitchCard />, container);
```

## API

### props

<table class="table table-bordered table-striped">
    <thead>
    <tr>
        <th style="width: 100px;">name</th>
        <th style="width: 50px;">type</th>
        <th style="width: 50px;">default</th>
        <th>description</th>
    </tr>
    </thead>
    <tbody>
        <tr>
          <td>prefixCls</td>
          <td>String</td>
          <td>rc-login</td>
          <td></td>
        </tr>
        <tr>
          <td>getCode</td>
          <td>fun</td>
          <td>''</td>
          <td>get code, param is phone value</td>
        </tr>
        <tr>
          <td>getLogin</td>
          <td>fun</td>
          <td></td>
          <td>login, first param is phone value, second param is code value</td>
        </tr>
    </tbody>
</table>

## Development

```
npm install
npm start
```

## Example

https://nvsky.github.io/react-switch-card-module/build/


