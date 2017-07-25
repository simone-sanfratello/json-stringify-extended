# json-stringify-extended

[![NPM Version](http://img.shields.io/npm/v/json-stringify-extended.svg?style=flat)](https://www.npmjs.org/package/json-stringify-extended)
[![NPM Downloads](https://img.shields.io/npm/dm/json-stringify-extended.svg?style=flat)](https://www.npmjs.org/package/json-stringify-extended)

[![JS Standard Style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)

JSON.stringify with extended data types support

types:
* string
* number
* boolean
* function
* Object
* Array
* Date
* RegExp
* null
* Infinity
* NaN
* undefined

You can also use not yet defined vars using ``stringify.defered``.

## Install

````bash
npm install json-stringify-extended
````

## Example

```js
const stringify = require('json-stringify-extended')

console.log(stringify(_test, options))
```

## Options

options.spacing
default '  ' (two spaces)

options.endline
default '\n'

options.prepend
default null
examples 'const foo ='

options.postpend
default null
examples ';\nmodule.exports=foo;'

options.quote
default null
' or "

options.keepUndefined
default false

options.filter
default null
function(prop, value)

options.replace
default null
function(prop, value)
example password

options.sort sort keys
default false

options.compress
default false
compress function body

options.safe
default false
if true, replace circular error with [Circular] and won't throw exception


@see 
https://www.npmjs.com/package/stringify-object
https://www.npmjs.com/package/json-stable-stringify
https://www.npmjs.com/package/jsesc


## License

The MIT License (MIT)

Copyright (c) 2017 braceslab

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
