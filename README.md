# json-stringify-extended

[![NPM Version](http://img.shields.io/npm/v/json-stringify-extended.svg?style=flat)](https://www.npmjs.org/package/json-stringify-extended)
[![NPM Downloads](https://img.shields.io/npm/dm/json-stringify-extended.svg?style=flat)](https://www.npmjs.org/package/json-stringify-extended)
[![JS Standard Style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)

JSON.stringify with extended data types support (such ``function`` type) and some options

## Purpose

- Stringify more than primitive types into JSON format
- Stringify in JavaScript Object
- Use not yet defined types (like enums)
- Avoid useless quotes
- Throw exception or not in circularity references

## Installing

````bash
npm i json-stringify-extended
````

### Quick start

```js
const stringify = require('json-stringify-extended')

const data = {
  a: 'basic set, default options',
  b: 1,
  c: true,
  d: function (a, b) { console.log(a + b) },
  e: {a: 0, b: 0.1, c: -2},
  f: ['a', 'b', 'c'],
  g: new Date('2017-01-01'),
  h: /a|b/,
  i: null,
  j: Infinity,
  k: NaN,
  l: undefined,
  m: stringify.deferred('my.enum.VALUE')
}

console.log(stringify(data))

// output
{
  a:"basic set, default options",
  b:1,
  c:true,
  d:function (a, b) { console.log(a + b) },
  e:{
    a:0,
    b:0.1,
    c:-2
  },
  f:["a","b","c"],
  g:new Date("2017-01-01T00:00:00.000Z"),
  h:/a|b/,
  i:null,
  j:Infinity,
  k:NaN,
  l:undefined,
  m:my.enum.VALUE
}

```

## Supported types

* ``String``
* ``Number``
* ``Boolean``
* ``function``
* ``Object``
* ``Array``
* ``Date``
* ``RegExp``
* ``null``
* ``Infinity``
* ``NaN``
* ``undefined``
* not-yet-defined using ``stringify.deferred``

## API docs

### stringify(data[, options])

Stringify data into string

#### data
Type: `any`

#### options
Type: `Object`

Options to adjust result format.  

You can also use prepared options:

- ``stringify.options.json``
  format to regular JSON format
- ``stringify.options.standadjs``
  format using standadjs rules
- ``stringify.options.compact``
  format without folding, quotes and spaces

**example**
````js
const data = {a: 'string', b: false, c: [0, 1, 2]}
console.log(stringify(data, stringify.options.compact))
// output
{a:'string',b:false,c:[0,1,2]}
````

##### options.safe
Type: `Boolean`  
Default: `false`

Works in safe mode, so will not throws exception for circularity.

##### options.endline
Type: `String`  
Default: `\n`

Endline string, should be only spacing chars as `\n` or `\r\n`. Set to empty string `''` for one line output.

##### options.spacing
Type: `String`  
Default: `  ` (two spaces)

Indentation string, should contains only spacing chars as `\t` or spaces ` `.

##### options.keyQuote
Type: `String`  
Default: `null`

Character used for quote keys, default is `null`, means no quotes in keys. Should be `"` or `'` or `null`

##### options.valueQuote
Type: `String`  
Default: `'`

Character used for quote values, default is `'`. Should be `"` or `'`

##### options.keySpace
Type: `Boolean`  
Default: `false`

Add a space beetwen `key:` and `value`.

##### options.replace
Type: `function(key:String, value:String) {key, value}`  
Default: `null`

Use function to replace ``value`` and/or ``key`` of each element.  
Must return an object ``{key, value}``.  

**example**
````js
const data = {
  user: 'alice',
  password: 'it-s-a-secret',
  id: 1,
  meta: ['1', 1]
}
const options = {
  replace: function (key, value) {
    if (key === 'password') {
      return {key: 'secret', value: '***'}
    }
    if (value === 1) {
      return {key, value: 'one'}
    }
    return {key, value}
  }
}
console.log(stringify(data, options))
// output
{
  user:"alice",
  secret:"***",
  id:"one",
  meta:["1","one"]
}
````

---

## TODO

- support Buffer, File
- options.discardUndefined
- options.compress
  compress data: function body, date value
- filter function
- sort keys

## License

The MIT License (MIT)

Copyright (c) 2017 [braces lab](https://braceslab.com)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
