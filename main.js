/**
 *
 * @param {*} data
 * @param {Boolean} options.safe works in safe mode, so will not throws exception for circularity; default false
 * @param {String} options.endline end line with; default '\n'
 * @param {String} options.spacing indentation string; default '  ' (two spaces)
 * @param {String} options.keyQuote character used for quote keys; default null - no quotes
 * @param {String} options.valueQuote character used for quote values; default "
 * @param {Boolean} options.keySpace add space after key: ; default false
 * @param {function(key:String, value:*)} options.replace replace data by key or value
 */
const stringify = function (data, options) {
  let __done = []
  let __keySpace

  const __options = function () {
    if (!options) {
      // default options
      options = {
        endline: '\n',
        spacing: '  ',
        keyQuote: null,
        keySpace: false,
        valueQuote: '"',
        safe: false,
        replace: null
      // @todo compress: false,
      // @todo filter: null,
      // @todo sort: false,
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
    }

    __keySpace = options.keySpace ? ' ' : ''
  }

  const __replace = function (str, find, replace) {
    if (str.indexOf(find) === -1) {
      return str
    }
    return str.split(find).join(replace)
  }

  const __circularity = function (val, path) {
    if (__done.indexOf(val) !== -1) {
      if (!options.safe) {
        throw new Error('Circular reference @ ' + path)
      }
      return true
    }
    __done.push(val)
    return false
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

      const _spacing0 = __spacing(deep)
      const _spacing1 = _spacing0 + options.spacing

      if (__circularity(obj, path)) {
        return options.endline + _spacing1 + '[Circularity]' + options.endline + _spacing0
      }

      const _out = []
      for (const key in obj) {
        let _path = path + '.' + key
        const _item = __main(key, obj[key], deep + 1, _path)

        // wrap strange key with quotes
        if (_item.key && !_item.key.match(/^\w[\d\w_]*$/)) {
          _item.key = __quote(key, options.keyQuote || '"')
        }
        _out.push(options.endline + _spacing1 + _item.key + ':' + __keySpace + _item.value)
      }
      return '{' + _out.join(',') + options.endline + _spacing0 + '}'
    },
    array: function (array, deep, path) {
      if (!path) {
        path = '[Array]'
      }

      if (__circularity(array, path)) {
        return '[Circularity]'
      }

      const _out = []
      for (let i = 0; i < array.length; i++) {
        const _path = path + '#' + i
        _out.push(__main(null, array[i], deep, _path).value)
      }
      return '[' + _out.join(',') + ']'
    },
    date: function (obj) {
      // @todo if compact obj.getTime
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
    return quote + __replace(value, quote, '\\' + quote) + quote
  }

  const __main = function (key, value, deep, path) {
    if (!deep) deep = 1

    if (options.replace) {
      ({key, value} = options.replace(key, value))
    }

    let _type = typeof value
    if (_type === 'object') {
      if (value instanceof Array) {
        _type = 'array'
      } else if (value instanceof Date) {
        _type = 'date'
      } else if (value instanceof RegExp) {
        _type = 'regexp'
      } else if (value instanceof stringify._deferred) {
        _type = 'deferred'
      } else if (value === null) {
        _type = 'null'
      }
    }

    return {key, value: __serialize[_type](value, deep, path)}
  }

  __options()
  return __main(null, data).value
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

// prepared options
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

if (typeof module !== 'undefined' && module.exports) {
  module.exports = stringify
}
