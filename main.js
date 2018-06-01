
const uglify = require('uglify-es')
const FUNCTION_COMPRESS_OPTIONS = {parse: {bare_returns: true}}
const FUNCTION_COMPRESS_NAMED = 'const f='
const FUNCTION_COMPRESS_NAMED_LENGTH = FUNCTION_COMPRESS_NAMED.length

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
  const __done = {
    values: [],
    paths: []
  }
  const __counter = {
    object: 0,
    array: 0
  }
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

    __keySpace = options.keySpace ? ' ' : ''
  }

  const __replace = function (str, find, replace) {
    if (str.indexOf(find) === -1) {
      return str
    }
    return str.split(find).join(replace)
  }

  const __circularity = function (val, path) {
    const i = __done.values.indexOf(val)
    if (i !== -1 && path.indexOf(__done.paths[i]) === 0) {
      if (!options.safe) {
        throw new Error('Circular reference @ ' + path)
      }
      return true
    }
    __done.values.push(val)
    __done.paths.push(path)
    return false
  }

  const __serialize = {
    function: function (obj) {
      if (options.compress) {
        let _min
        try {
          _min = uglify.minify(obj.toString(), FUNCTION_COMPRESS_OPTIONS)
          if (!_min.code) {
            _min = uglify.minify(FUNCTION_COMPRESS_NAMED + obj.toString(), FUNCTION_COMPRESS_OPTIONS)
            _min.code = _min.code.substr(FUNCTION_COMPRESS_NAMED_LENGTH)
          }
          const _code = _min.code || obj.toString()
          return _code.replace(/;+$/, '')
        } catch (e) {
          console.warn('unable to compress function', obj.toString(), _min.error)
          return obj.toString()
        }
      }
      return obj.toString()
    },
    number: function (obj) {
      return obj
    },
    string: function (obj) {
      if (obj.indexOf('\n') !== -1) {
        obj = obj.split('\n').join('\\n')
      }
      if (obj.indexOf('\t') !== -1) {
        obj = obj.split('\t').join('\\t')
      }
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
    date: function (obj) {
      if (options.compress) {
        return 'new Date(' + obj.getTime() + ')'
      }
      return 'new Date(' + options.valueQuote + obj.toISOString() + options.valueQuote + ')'
    },
    regexp: function (obj) {
      return obj.toString()
    },
    buffer: function (obj) {
      // @todo check nodejs version?
      return 'Buffer.from(' + options.valueQuote + obj.toString('base64') + options.valueQuote + ')'
    },
    object: function (obj, deep, path) {
      __counter.object++
      if (!path) {
        path = '{}'
      }

      const _spacing0 = __spacing(deep)
      const _spacing1 = _spacing0 + options.spacing

      if (__circularity(obj, path)) {
        return options.endline + _spacing1 + '[Circularity]' + options.endline + _spacing0
      }

      const _out = []
      for (const key in obj) {
        const _path = path + '.' + key
        const _item = __item(key, obj[key], deep + 1, _path)

        // if item is discarded by filtering
        if (!_item) {
          continue
        }

        // wrap strange key with quotes
        if (_item.key) {
          if (_item.key.match(/^[^a-zA-Z]/) || !_item.key.match(/^\w[\d\w_]*$/)) {
            _item.key = __quote(key, options.keyQuote || '"')
          }
        }
        _out.push(options.endline + _spacing1 + _item.key + ':' + __keySpace + _item.value)
      }
      return '{' + _out.join(',') + options.endline + _spacing0 + '}'
    },
    array: function (array, deep, path) {
      __counter.array++
      if (!path) {
        path = '[]'
      }

      if (__circularity(array, path)) {
        return '[Circularity]'
      }

      const _spacing0 = __spacing(deep)
      const _spacing1 = _spacing0 + options.spacing

      const _out = []
      for (let i = 0; i < array.length; i++) {
        const _path = path + '.' + i
        const _item = __item(null, array[i], deep + 1, _path)
        if (_item) {
          _out.push(options.endline + _spacing1 + _item.value)
        }
      }
      return '[' + _out.join(',') + options.endline + _spacing0 + ']'
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

  const __item = function (key, value, deep, path) {
    if (!deep) deep = 1

    if ((options.discard) && (value === undefined || value === null)) {
      return null
    }

    if (options.filter && !options.filter(key, value)) {
      return null
    }

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
      } else if (value instanceof Buffer) {
        _type = 'buffer'
      } else if (value instanceof stringify._deferred) {
        _type = 'deferred'
      } else if (value === null) {
        _type = 'null'
      }
    }

    return {key, value: __serialize[_type](value, deep, path)}
  }

  __options()
  const _item = __item(null, data)
  return _item ? _item.value : {}
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

module.exports = stringify
