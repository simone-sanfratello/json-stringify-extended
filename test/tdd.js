var _test = {
  adefered: new json-stringify-all.Defered('my.Custom.ENUM'), // my.Custom.ENUM is not yet defined
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
