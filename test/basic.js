const tap = require('tap')
const stringify = require('../src/main')

tap.test('stringify - basic data set, default options', (test) => {
  test.plan(1)
  const data = {
    a: 'lorem ipsum',
    b: 1,
    c: true,
    d: function (a, b) { console.log(a + b) },
    e: { a: 0, b: 0.1, c: -2 },
    f: ['a', 'b', 'c'],
    g: new Date('2017-01-01'),
    h: /a|b/,
    i: null,
    j: Infinity,
    k: NaN,
    l: undefined,
    m: Buffer.from('7468697320697320612074c3a97374', 'hex'),
    n: 'multi\nline\nstring',
    o: `another
    multiline
string`,
    p: '\ttab char'
  }
  const result = `{
  a:"lorem ipsum",
  b:1,
  c:true,
  d:function (a, b) { console.log(a + b) },
  e:{
    a:0,
    b:0.1,
    c:-2
  },
  f:[
    "a",
    "b",
    "c"
  ],
  g:new Date("2017-01-01T00:00:00.000Z"),
  h:/a|b/,
  i:null,
  j:Infinity,
  k:NaN,
  l:undefined,
  m:Buffer.from("dGhpcyBpcyBhIHTDqXN0"),
  n:"multi\\nline\\nstring",
  o:"another\\n    multiline\\nstring",
  p:"\\ttab char"
}`
  test.equal(stringify(data), result)
})

tap.test('stringify - basic data set, custom options', (test) => {
  test.plan(1)
  const data = {
    a: 'lorem ipsum',
    b: 1,
    c: true,
    d: function (a, b) { console.log(a + b) },
    e: { a: 0, b: 0.1, c: -2 },
    f: ['a', 'b', 'c'],
    g: new Date('2017-01-01'),
    h: /a|b/,
    i: null,
    j: Infinity,
    k: NaN,
    l: undefined,
    "a weid key": 'op op'
  }
  const options = {
    valueQuote: "'",
    keySpace: true
  }
  const result = `{
  a: 'lorem ipsum',
  b: 1,
  c: true,
  d: function (a, b) { console.log(a + b) },
  e: {
    a: 0,
    b: 0.1,
    c: -2
  },
  f: [
    'a',
    'b',
    'c'
  ],
  g: new Date('2017-01-01T00:00:00.000Z'),
  h: /a|b/,
  i: null,
  j: Infinity,
  k: NaN,
  l: undefined,
  "a weid key": 'op op'
}`
  test.equal(stringify(data, options), result)
})

tap.test('stringify - fix keys', (test) => {
  test.plan(1)
  const data = {
    '1number': 0,
    ':colon': 0,
    _underscore: 1,
    ' space': 0,
    ' space': 0,
    thunder: 1,
    storm: 1,
    'thunder-storm': 0,
    'thunder.storm': 0,
    'dquoted"key': 0,
    "squoted'key": 0,
    '$thunder.storm': 0
  }
  const options = { spacing: '', endline: '', fixKeys: true }
  const result = '{"1number":0,":colon":0,"_underscore":1," space":0,thunder:1,storm:1,"thunder-storm":0,"thunder.storm":0,"dquoted\\"key":0,"squoted\'key":0,"$thunder.storm":0}'
  test.equal(stringify(data, options), result)
})

tap.test('stringify - deferred type', (test) => {
  test.plan(1)
  const data = { a: stringify.deferred('my.enum.VALUE') }
  const options = { spacing: '', endline: '' }
  const result = '{a:my.enum.VALUE}'
  test.equal(stringify(data, options), result)
})

tap.test('stringify - unsafe circularity in object', (test) => {
  test.plan(1)
  const data = { a: { b: { c: 0 } } }
  data.a.b.d = data.a
  test.throw(() => {
    stringify(data)
  })
})

tap.test('stringify - unsafe circularity in array (1)', (test) => {
  test.plan(1)
  const data = [0, {}, 2, {}]
  data[3].a = data[3]
  test.throw(() => {
    stringify(data)
  })
})

tap.test('stringify - unsafe circularity in array (2)', (test) => {
  test.plan(1)
  const data = [[], []]
  data[0].push(data[1])
  data[1].push(data[0])
  test.throw(() => {
    stringify(data)
  })
})

tap.test('stringify - unsafe double circularity', (test) => {
  test.plan(1)
  const data = { a: { c: {}, b: {} } }
  data.b = data.a
  data.a.c.d = data.b
  test.throw(() => {
    stringify(data)
  })
})

tap.test('stringify - not a circularity (1)', (test) => {
  test.plan(1)
  const list = ['a', 'b', 'c']
  const data = [
    { a: list },
    { b: list }
  ]
  const result = '[{a:["a","b","c"]},{b:["a","b","c"]}]'

  const options = { endline: '', spacing: '' }
  test.equal(stringify(data, options), result)
})

tap.test('stringify - not a circularity (2)', (test) => {
  test.plan(1)
  const list = ['a', 'b', 'c']
  const data = [
    { a: list },
    { a: list }
  ]
  const result = '[{a:["a","b","c"]},{a:["a","b","c"]}]'

  const options = { endline: '', spacing: '' }
  test.equal(stringify(data, options), result)
})

tap.test('stringify - safe circularity in object', (test) => {
  test.plan(1)
  const data = { a: { b: { c: 0 } } }
  data.a.b.d = data.a
  const result = '{a:{b:{c:0,d:[Circularity]}}}'

  const options = { safe: true, endline: '', spacing: '' }
  test.equal(stringify(data, options), result)
})

tap.test('stringify - safe circularity in array', (test) => {
  test.plan(1)
  const data = [0, [], 2, []]
  data[3][0] = data[3]
  const result = '[0,[],2,[[Circularity]]]'

  const options = { safe: true, endline: '', spacing: '' }
  test.equal(stringify(data, options), result)
})

tap.test('stringify - bad data set, default options', (test) => {
  test.plan(1)
  const data = {
    'quoted"key': 'quoted"value',
    "dquoted'key": "dquoted'value",
    'bad key -_"\' .£$,': '???',
    'multiline function': function (a, b) {
      console.log(a + b)
      return true
    },
    mixed_array: ['a', -1, null, undefined, new Date('2016-12-31')]
  }

  const result = `{
  "quoted\\"key":"quoted\\"value",
  "dquoted'key":"dquoted'value",
  "bad key -_\\"' .£$,":"???",
  "multiline function":function (a, b) {
      console.log(a + b)
      return true
    },
  mixed_array:[
    "a",
    -1,
    null,
    undefined,
    new Date("2016-12-31T00:00:00.000Z")
  ]
}`
  test.equal(stringify(data), result)
})

tap.test('stringify - using prepared options.compact', (test) => {
  test.plan(1)
  const data = { a: 'string', b: false, c: [0, 1, 2] }
  const result = '{a:\'string\',b:false,c:[0,1,2]}'
  test.equal(stringify(data, stringify.options.compact), result)
})

tap.test('stringify - use options.replace', (test) => {
  test.plan(1)
  const data = {
    user: 'alice',
    password: 'it-s-a-secret',
    id: 1,
    meta: ['1', 1]
  }
  const options = {
    replace: function (key, value) {
      if (key === 'password') {
        return { key: 'secret', value: '***' }
      }
      if (value === 1) {
        return { key, value: 'one' }
      }
      return { key, value }
    }
  }
  const result = `{
  user:"alice",
  secret:"***",
  id:"one",
  meta:[
    "1",
    "one"
  ]
}`
  test.equal(stringify(data, options), result)
})

tap.test('stringify - use options.replace not a function', (test) => {
  test.plan(1)
  const data = { user: 'alice' }
  const options = {
    replace: 0
  }
  test.throw(() => {
    stringify(data, options)
  })
})

tap.test('stringify - use options.filter', (test) => {
  test.plan(1)
  const data = {
    user: 'alice',
    password: 'it-s-a-secret',
    id: 1,
    meta: ['1', 1],
    greet: function () { return 'hi' }
  }
  const options = {
    filter: function (key, value) {
      if (key === 'password') {
        return false
      }
      if (value === 1) {
        return false
      }
      if (typeof value === 'function') {
        return false
      }
      return true
    }
  }
  const result = `{
  user:"alice",
  meta:[
    "1"
  ]
}`
  test.equal(stringify(data, options), result)
})

tap.test('stringify - use options.filter not a function', (test) => {
  test.plan(1)
  const data = { user: 'alice' }
  const options = {
    filter: ''
  }
  test.throw(() => {
    stringify(data, options)
  })
})

tap.test('stringify - use options.discard', (test) => {
  test.plan(1)
  const data = {
    a: '',
    b: 1,
    c: 0,
    d: true,
    e: false,
    f: null,
    g: undefined
  }
  const options = {
    discard: true,
    spacing: '\t'
  }
  const result = `{
\ta:"",
\tb:1,
\tc:0,
\td:true,
\te:false
}`
  test.equal(stringify(data, options), result)
})

tap.test('stringify - use options.compress', (test) => {
  test.plan(1)
  const data = {
    a: new Date('2014-12-10T05:00:00.000Z'),
    b: Buffer.from('base64-iamge'),
    c: function freakyfib (num) {
      var a = 1; var b = 0; var temp

      while (num >= 0) {
        temp = a
        a = a + b
        b = temp
        num--
        // random comment
      }
      return b
      const useless = 6
    },
    f: null,
    g: undefined

  }
  const options = {
    compress: true,
    spacing: '',
    endline: ''
  }
  const result = '{a:new Date(1418187600000),b:Buffer.from("YmFzZTY0LWlhbWdl"),c:function freakyfib(r){for(var f,n=1,a=0;r>=0;)f=n,n+=a,a=f,r--;return a},f:null,g:undefined}'
  test.equal(stringify(data, options), result)
})

tap.test('stringify - function compression (1)', (test) => {
  test.plan(1)
  const data = {
    a: function () {},
    b: () => { return true },
    c: function _void (none) { },
    d: function summyEs6 (a, b, c) {
      const d = a + b
      const e = c
      return d + e
    },
    e: function summyEs5 (a, b, c) {
      const d = a + b
      const e = c
      return d + e
    },
    f: function (a, b, c) {
      const d = a + b
      const e = c
      return d + e
    },
    g: function named () {},
    h: function () { return 'a string' }
  }
  // https://github.com/braceslab/json-stringify-extended/issues/2
  const _fn = function () { return 0 }
  _fn.toString = function () { return 1 }
  data.i = _fn
  data.l = _fn

  const options = {
    compress: true,
    spacing: '',
    endline: ''
  }
  const result = '{a:function(){},b:()=>!0,c:function _void(i){},d:function summyEs6(n,u,m){return n+u+m},e:function summyEs5(n,u,m){return n+u+m},f:function(n,t,c){return n+t+c},g:function named(){},h:function(){return"a string"},i:1,l:1}'
  test.equal(stringify(data, options), result)
})

// https://github.com/braceslab/json-stringify-extended/issues/2
tap.test('stringify - function compression (2)', (test) => {
  test.plan(1)
  const fn = function () {}
  fn.toString = function () { return "'test'" }
  const data = { a: fn, b: fn }
  const options = {
    compress: true,
    spacing: '',
    endline: ''
  }
  const result = '{a:"test",b:"test"}'
  test.equal(stringify(data, options), result)
})

tap.test('stringify - function compression (3)', (test) => {
  test.plan(1)
  const fn = Math.abs
  const data = { a: fn, b: fn }
  const options = {
    compress: true,
    spacing: '',
    endline: ''
  }

  test.equal(stringify(data, options), "{a:function abs() { [native code] },b:function abs() { [native code] }}")
})

tap.test('stringify - multiline strings', (test) => {
  test.plan(1)
  const data = {
    a: `line0
line1`
  }
  const result = `{
  a:"line0\\nline1"
}`
  test.equal(stringify(data), result)
})

tap.test('stringify - recordset', (test) => {
  test.plan(1)
  const data = {
    a: [{ name: 'Al', age: 2 }, { name: 'Bob', age: 3 }, { name: 'Carl', age: 4 }],
    c: { name: 'Dan', age: 5, d: { name: 'El', age: 6 } }
  }
  const result = `{
  a:[
    {
      name:"Al",
      age:2
    },
    {
      name:"Bob",
      age:3
    },
    {
      name:"Carl",
      age:4
    }
  ],
  c:{
    name:"Dan",
    age:5,
    d:{
      name:"El",
      age:6
    }
  }
}`
  test.equal(stringify(data), result)
})

tap.test('stringify - discard', (test) => {
  test.plan(1)
  test.equal(stringify({ a: null }, { discard: true }), "{\n}")
})

tap.test('stringify - null', (test) => {
  test.plan(1)
  test.equal(stringify(null), "null")
})

tap.test('stringify - undefined', (test) => {
  test.plan(1)
  test.equal(stringify(undefined), "undefined")
})

tap.test('stringify - minimal', (test) => {
  test.plan(1)
  test.equal(stringify({ a: 1 }), "{\n  a:1\n}")
})

tap.test('stringify - Symbol', (test) => {
  test.plan(1)
  const options = {
    compress: true,
    spacing: '',
    endline: ''
  }
  test.equal(stringify({ empty: Symbol(), a: Symbol('a') }, options), 
    "{empty:Symbol(\"\"),a:Symbol(\"a\")}")
})

tap.test('stringify - Map', (test) => {
  test.plan(1)
  const options = {
    compress: true,
    spacing: '',
    endline: ''
  }
  test.equal(stringify({ empty: new Map(), a: new Map([['a', 1], ['b', 2], [3, 4]]) }, options), 
    '{empty:new Map(),a:new Map([["a",1],["b",2],[3,4]])}')
})

tap.test('stringify - Set', (test) => {
  test.plan(1)
  const options = {
    compress: true,
    spacing: '',
    endline: ''
  }
  test.equal(stringify({ empty: new Set(), a: new Set([1,2,3,4,5]) }, options), 
    "{empty:new Set(),a:new Set([1,2,3,4,5])}")
})
