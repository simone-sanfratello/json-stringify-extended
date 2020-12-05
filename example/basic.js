const stringify = require('../src/main')

const data = {
  a: 'basic set, default options',
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
  m: stringify.deferred('my.enum.VALUE'),
  n: Buffer.from('7468697320697320612074c3a97374', 'hex'),
  o: Symbol('cross'),
  p: new Map([[1, 'Rico'], [2, 'Mimi']]),
  q: new Set(['cuori', 'quadri', 'picche', 'fiori'])
}

console.log(stringify(data))
