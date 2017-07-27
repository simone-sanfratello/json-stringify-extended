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
    l: undefined
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
  f:["a","b","c"],
  g:new Date("2017-01-01T00:00:00.000Z"),
  h:/a|b/,
  i:null,
  j:Infinity,
  k:NaN,
  l:undefined
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
  f: ['a','b','c'],
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
  mixed_array:["a",-1,null,undefined,new Date("2016-12-31T00:00:00.000Z")]
}`
  test.equal(stringify(data), result)
})

tap.test('stringify - using prepared options.compact', (test) => {
  test.plan(1)
  const data = {a: 'string', b: false, c: [0, 1, 2]}
  const result = `{a:'string',b:false,c:[0,1,2]}`
  console.log(stringify(data, stringify.options.compact))
  test.equal(stringify(data, stringify.options.compact), result)
})
