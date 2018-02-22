const tap = require('tap')
const stringify = require('../main')

tap.test('stringify - basic data set, default options', (test) => {
  test.plan(1)
  const data = {
    a: 'lorem ipsum',
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
    e: {a: 0, b: 0.1, c: -2},
    f: ['a', 'b', 'c'],
    g: new Date('2017-01-01'),
    h: /a|b/,
    i: null,
    j: Infinity,
    k: NaN,
    l: undefined
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
  l: undefined
}`
  test.equal(stringify(data, options), result)
})

tap.test('stringify - deferred type', (test) => {
  test.plan(1)
  const data = {a: stringify.deferred('my.enum.VALUE')}
  const options = {spacing: '', endline: ''}
  const result = `{a:my.enum.VALUE}`
  test.equal(stringify(data, options), result)
})

tap.test('stringify - unsafe circularity in object', (test) => {
  test.plan(1)
  const data = {a: {b: {c: 0}}}
  data.a.b.d = data.a
  test.throw(() => {
    stringify(data)
  })
})

tap.test('stringify - unsafe circularity in array', (test) => {
  test.plan(1)
  const data = [0, {}, 2, {}]
  data[3].a = data[1]
  test.throw(() => {
    stringify(data)
  })
})

tap.test('stringify - safe circularity in object', (test) => {
  test.plan(1)
  const data = {a: {b: {c: 0}}}
  data.a.b.d = data.a
  const result = `{a:{b:{c:0,d:[Circularity]}}}`

  const options = {safe: true, endline: '', spacing: ''}
  test.equal(stringify(data, options), result)
})

tap.test('stringify - safe circularity in array', (test) => {
  test.plan(1)
  const data = [0, [], 2, []]
  data[3][0] = data[1]
  const result = `[0,[],2,[[Circularity]]]`

  const options = {safe: true, endline: '', spacing: ''}
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
  const data = {a: 'string', b: false, c: [0, 1, 2]}
  const result = `{a:'string',b:false,c:[0,1,2]}`
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
        return {key: 'secret', value: '***'}
      }
      if (value === 1) {
        return {key, value: 'one'}
      }
      return {key, value}
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
  const data = {user: 'alice'}
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
  const data = {user: 'alice'}
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
    c: function freakyfib(num) {
      var a = 1, b = 0, temp;

      while (num >= 0) {
        temp = a
        a = a + b
        b = temp
        num--
        // random comment
      }
      return b;
      var useless = 6
    },
    f: null,
    g: undefined

  }
  const options = {
    compress: true,
    spacing: '',
    endline: ''
  }
  const result = `{a:new Date(1418187600000),b:Buffer.from("YmFzZTY0LWlhbWdl"),c:function freakyfib(r){for(var f,n=1,a=0;r>=0;)f=n,n+=a,a=f,r--;return a}}`
  test.equal(stringify(data, options), result)
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

tap.test('stringify - array of objects', (test) => {
  test.plan(1)
  const data = {
    a: [{ name: 'Al', age: 2}, {name: 'Bob', age: 3}, {name: 'Carl', age: 4}],
    c: {name: 'Dan', age: 5, d: {name: 'El', age: 6}}, 
    
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
