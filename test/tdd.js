const tap = require('tap')
const stringify = require('../main')

tap.test('stringify - basic set, default options', (test) => {
  test.plan(1)
  const data = {a: 'basic set, default options',
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
  l:undefined
}`
  // console.log(stringify(data))
  test.equal(stringify(data), result)
})

tap.test('stringify - basic set, custom options', (test) => {
  test.plan(1)
  const data = {a: 'basic set, custom options',
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
  a: 'basic set, custom options',
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
  console.log(stringify(data, options))
  test.equal(stringify(data, options), result)
})

/*
var _test = {
  adefered: stringify.defered('my.Custom.ENUM'), // my.Custom.ENUM is not yet defined
  astring: 'katia',
  anarray: [1, 'alice', 'rico', 'mimi', 2, 3, new Date()],
  aquoting: 'hi "mr ',
  abool: true,
  anotherbool: false,
  anundefined: undefined,
  anull: null,
  anan: NaN,
  ainfinity: Infinity,
  aclass: {
    afunction: function () { return 'hi' },
    afloat: 7.8
  },
  aregexp: /(\w)+/,
  atree: {
    one: 1,
    two: 'two',
    three: {
      threeone: {
        1: '3.1'
      }
    },
    four: 4.01,
    five: 5
  },
  '1astrangekey': 123,
  'strange-key_two': 0,
  normal_key: -1,
  'awful key ': 'a',
  'dotted.key.com': 'www',
  'very".awsul.key': '123',
  "why use a string for a key? 'cause I can ...": '?\'"'
}

// var jsfy = require('./main')
var jsfy = require('jsfy')

var _test = {
  astring: 'katia',
  anarray: [1, 'alice', 'rico', 'mimi', 2, 3, new Date()],
  aquoting: 'hi "mr ',
  abool: true,
  anotherbool: false,
  anundefined: undefined,
  anull: null,
  amath: function (x, y) {
    return Math.min(x, y)
  },
  anan: NaN,
  ainfinity: Infinity,
  aclass: {
    afunction: function () {
      return 'hi'
    },
    afloat: 7.8
  },
  aregexp: /(\w)+/,
  atree: {
    one: 1,
    two: 'two',
    three: {
      threeone: {
        1: '3.1'
      }
    },
    four: 4.01,
    five: 5
  },
  '1astrangekey': 123,
  'strange-key_two': 0,
  normal_key: -1,
  'awful key ': 'a',
  'dotted.key.com': 'www',
  'very".awsul.key': '123',
  "why use a string for a key? 'cause I can ...": '?\'"',
  adefered: new jsfy.Defered('my.Custom.ENUM')
}

// output tests
console.log(jsfy(_test, 2, '\n'))
console.log(jsfy(_test, '  ', null, 'data'))

// circular reference object
var _circle = {
  a: {
    b: {
      c: 1
    }
  }
}
_circle.a.b.d = _circle.a
try {
  console.log(jsfy(_circle))
} catch (err) {
  console.log(err)
}

// circular reference array
var _array = [0, {}, 2, {}]
_array[3].a = _array[1]
try {
  console.log(jsfy(_array))
} catch (err) {
  console.log(err)
}

*/
