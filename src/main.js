'use strict'

const uglify = require('uglify-es')
const FUNCTION_COMPRESS_OPTIONS = { parse: { bare_returns: true } }
const FUNCTION_COMPRESS_NAMED = 'const f='
const FUNCTION_COMPRESS_NAMED_LENGTH = FUNCTION_COMPRESS_NAMED.length

// regexp collection
const SYMBOL_STRIP = /Symbol\((.*)\)/
const IRREGULAR_KEY = /^[^a-zA-Z]/
const SQUARED_IN_KEY =  /^\w[\d\w_]*$/
const STRIP_TRAILING_SEMICOLON = /;+$/

/**
 *
 * @param {*} data
 * @param {Boolean} options.safe works in safe mode, so will not throws exception for circularity; default false
 * @param {String} options.endline end line with; default '\n'
 * @param {String} options.spacing indentation string; default '  ' (two spaces)
 * @param {String} options.keyQuote character used for quote keys; default null - no quotes
 * @param {String} options.valueQuote character used for quote values; default "
 * @param {Boolean} options.keySpace add space after key: ; default false
 * @param {function(key:String, value:*)} options.replace replace by key or value
 * @param {function(key:String, value:*)} options.filter filter by key or value
 * @param {Boolean} options.discard discard null and undefined values; default false
 * @param {Boolean} options.compress compress data like function, Date, Buffer; default false
 */
const stringify = function (data, options) {
  const _done = {
    values: [],
    paths: []
  }
  const _counter = {
    object: 0,
    array: 0
  }
  let _keySpace

  function validate (options) {
    if (!options) {
      // default options
      options = {
        endline: '\n',
        spacing: '  ',
        keyQuote: null,
        keySpace: false,
        valueQuote: '"',
        safe: false,
        replace: null,
        filter: null,
        discard: false,
        compress: false
      }
    } else {
      if (!options.endline && options.endline !== '') {
        options.endline = '\n'
      }
      if (!options.spacing && options.spacing !== '') {
        options.spacing = '  '
      }
      if (!options.valueQuote) {
        options.valueQuote = '"'
      }
      if (options.replace !== undefined && typeof options.replace !== 'function') {
        throw new Error('options.replace is not a function')
      }
      if (options.filter !== undefined && typeof options.filter !== 'function') {
        throw new Error('options.filter is not a function')
      }
    }

    _keySpace = options.keySpace ? ' ' : ''
    return options
  }

  function replace (str, find, replace) {
    if (str.indexOf(find) === -1) {
      return str
    }
    return str.split(find).join(replace)
  }

  function circularity (val, path) {
    const i = _done.values.indexOf(val)
    if (i !== -1 && path.indexOf(_done.paths[i]) === 0) {
      if (!options.safe) {
        throw new Error('Circular reference @ ' + path)
      }
      return true
    }
    _done.values.push(val)
    _done.paths.push(path)
    return false
  }

  const _serialize = {
    function: function (obj) {
      if (options.compress) {
        let _min
        try {
          _min = uglify.minify(obj.toString(), FUNCTION_COMPRESS_OPTIONS)
          if (!_min.code) {
            _min = uglify.minify(FUNCTION_COMPRESS_NAMED + obj.toString(), FUNCTION_COMPRESS_OPTIONS)
            _min.code = _min.code.substr(FUNCTION_COMPRESS_NAMED_LENGTH)
          }
          const _code = _min.code// ? || obj.toString()
          return _code.replace(STRIP_TRAILING_SEMICOLON, '')
        } catch (error) {
          console.warn('unable to compress function', obj.toString(), _min.error)
          return obj.toString()
        }
      }
      return obj.toString()
    },
    number: function (n) {
      return n
    },
    string: function (str) {
      if (str.indexOf('\n') !== -1) {
        str = str.split('\n').join('\\n')
      }
      if (str.indexOf('\t') !== -1) {
        str = str.split('\t').join('\\t')
      }
      return quote(str, options.valueQuote)
    },
    boolean: function (value) {
      return value ? 'true' : 'false'
    },
    null: function () {
      return 'null'
    },
    undefined: function () {
      return 'undefined'
    },
    deferred: function (val) {
      return val.toString()
    },
    date: function (date) {
      if (options.compress) {
        return 'new Date(' + date.getTime() + ')'
      }
      return 'new Date(' + options.valueQuote + date.toISOString() + options.valueQuote + ')'
    },
    symbol: function (symbol) {
      return 'Symbol(' + options.valueQuote + symbol.toString().match(SYMBOL_STRIP)[1] + options.valueQuote + ')'
    },
    regexp: function (obj) {
      return obj.toString()
    },
    buffer: function (obj) {
      return 'Buffer.from(' + options.valueQuote + obj.toString('base64') + options.valueQuote + ')'
    },
    object: function (obj, deep, path) {
      _counter.object++
      if (!path) {
        path = '{}'
      }

      const _spacing0 = spacing(deep)
      const _spacing1 = _spacing0 + options.spacing

      if (circularity(obj, path)) {
        return options.endline + _spacing1 + '[Circularity]' + options.endline + _spacing0
      }

      const _out = []
      for (const key in obj) {
        const _path = path + '.' + key
        const _item = item(key, obj[key], deep + 1, _path)

        // if item is discarded by filtering
        if (!_item) {
          continue
        }

        // wrap strange key with quotes
        if (_item.key.match(IRREGULAR_KEY) || !_item.key.match(SQUARED_IN_KEY)) {
          _item.key = quote(key, options.keyQuote || '"')
        }
        _out.push(options.endline + _spacing1 + _item.key + ':' + _keySpace + _item.value)
      }
      return '{' + _out.join(',') + options.endline + _spacing0 + '}'
    },
    array: function (array, deep, path) {
      _counter.array++
      if (!path) {
        path = '[]'
      }

      if (circularity(array, path)) {
        return '[Circularity]'
      }

      const _spacing0 = spacing(deep)
      const _spacing1 = _spacing0 + options.spacing

      const _out = []
      for (let i = 0; i < array.length; i++) {
        const _path = path + '.' + i
        const _item = item(null, array[i], deep + 1, _path)
        if (_item) {
          _out.push(options.endline + _spacing1 + _item.value)
        }
      }
      return '[' + _out.join(',') + options.endline + _spacing0 + ']'
    }
  }

  function spacing (deep) {
    let spacing = ''
    for (let i = 0; i < deep - 1; i++) {
      spacing += options.spacing
    }
    return spacing
  }

  function quote (value, quote) {
    return quote + replace(value, quote, '\\' + quote) + quote
  }

  function item (key, value, deep, path) {
    if (!deep) deep = 1

    if ((options.discard) && (value === undefined || value === null)) {
      return null
    }

    if (options.filter && !options.filter(key, value)) {
      return null
    }

    if (options.replace) {
      ({ key, value } = options.replace(key, value))
    }

    let _type = typeof value
    if (_type === 'object') {
      if (value instanceof Array) {
        _type = 'array'
      } else if (value instanceof Date) {
        _type = 'date'
      } else if (value instanceof RegExp) {
        _type = 'regexp'
      } else if (value instanceof Buffer) {
        _type = 'buffer'
      } else if (value instanceof stringify._deferred) {
        _type = 'deferred'
      } else if (value === null) {
        _type = 'null'
      }
    }

    return { key, value: _serialize[_type](value, deep, path) }
  }

  options = validate(options)
  const _item = item(null, data)
  return _item.value
}

// deferred type
stringify.deferred = function (val) {
  this.val = val
  return new stringify._deferred(val)
}

stringify._deferred = function (val) {
  this.val = val
}

stringify._deferred.prototype.toString = function () {
  return this.val
}

// preset options
stringify.options = {
  json: {
    keyQuote: '"',
    keySpace: true
  },
  standardjs: {
    keySpace: true,
    valueQuote: "'"
  },
  compact: {
    valueQuote: "'",
    endline: '',
    spacing: ''
  }
}

module.exports = stringify
