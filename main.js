/**
 *
 * @param {*} data
 * @param {string} options.endline end line with, default '\n'
 * @param {string} options.spacing indentation string, default '  ' (two spaces)
 * @param {string} options.keyQuote character used for quote keys, default null - no quotes
 * @param {string} options.valueQuote character used for quote values, default "
 * @param {boolean} options.keySpace add space after key: , default false
 */
const stringify = function (data, options) {
  var __done = []

  const __options = function () {
    if (!options) {
      // default options
      options = {
        endline: '\n',
        spacing: '  ',
        keyQuote: null,
        keySpace: false,
        valueQuote: '"'
      // @todo compress: false,
      // @todo filter: null,
      // @todo replace: null,
      // @todo sort: false,
      // @todo safe: false
      }
      return
    }

    if (!options.endline && options.endline !== '') {
      options.endline = '\n'
    }
    if (!options.spacing && options.spacing !== '') {
      options.spacing = '  '
    }
    if (!options.valueQuote) {
      options.valueQuote = '"'
    }
  }

  const __replace = function (str, find, replace) {
    if (str.indexOf(find) === -1) {
      return str
    }
    return str.split(find).join(replace)
  }

  const __checkCircular = function (val, path) {
    // @todo if options.safe
    if (__done.indexOf(val) !== -1) {
      throw new Error('ERROR: circular reference @ ' + path)
    }

    __done.push(val)
  }

  const __serialize = {
    function: function (obj) {
      return obj.toString()
    },
    number: function (obj) {
      return obj
    },
    string: function (obj) {
      return __quote(obj, options.valueQuote)
    },
    boolean: function (obj) {
      return obj ? 'true' : 'false'
    },
    null: function () {
      return 'null'
    },
    undefined: function () {
      return 'undefined'
    },
    deferred: function (obj) {
      return obj.toString()
    },
    object: function (obj, deep, path) {
      if (!path) {
        path = '[Object]'
      }
      __checkCircular(obj, path)
      const _spacing0 = __spacing(deep)
      const _spacing1 = _spacing0 + options.spacing

      const _out = []
      for (const key in obj) {
        // wrap strange key with quotes
        let _key = key.match(/^\w[\d\w_]*$/)
          ? key
          : __quote(key, options.keyQuote || '"')
        let _path = path + '.' + key
        _out.push(options.endline + _spacing1 + _key + ':' + (options.keySpace ? ' ' : '') + __main(obj[key], deep + 1, _path))
      }
      return '{' + _out.join(',') + options.endline + _spacing0 + '}'
    },
    array: function (obj, deep, path) {
      if (!path) {
        path = '[Array]'
      }
      __checkCircular(obj, path)

      const _out = []
      for (let i = 0; i < obj.length; i++) {
        let _path = path + '#' + i
        _out.push(__main(obj[i], deep, _path))
      }
      return '[' + _out.join(',') + ']'
    },
    date: function (obj) {
      return 'new Date(' + options.valueQuote + obj.toISOString() + options.valueQuote + ')'
    },
    regexp: function (obj) {
      return obj.toString()
    }
  }

  const __spacing = function (deep) {
    let _spacing = ''
    for (let i = 0; i < deep - 1; i++) {
      _spacing += options.spacing
    }
    return _spacing
  }

  const __quote = function (value, quote) {
    if (!quote) {
      return value
    }
    return quote + __replace(value, quote, '\\' + quote) + quote
  }

  const __main = function (obj, deep, path) {
    if (!deep) deep = 1

    let _type = typeof obj
    if (_type === 'object') {
      if (obj instanceof Array) {
        _type = 'array'
      } else if (obj instanceof Date) {
        _type = 'date'
      } else if (obj instanceof RegExp) {
        _type = 'regexp'
      } else if (obj instanceof stringify._deferred) {
        _type = 'deferred'
      } else if (obj === null) {
        _type = 'null'
      }
    }

    return __serialize[_type](obj, deep, path)
  }

  __options()
  return __main(data)
}

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

stringify.options = {
  json: { },
  module: { }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = stringify
}
