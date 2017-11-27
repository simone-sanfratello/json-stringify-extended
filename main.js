'use strict'

const uglify = require('uglify-js')

const FUNCTION_COMPRESS_OPTIONS = {

}

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
      if (options.compress) {
        let _min
        try {
          _min = uglify.minify(obj.toString(), FUNCTION_COMPRESS_OPTIONS)
          return _min.code
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
        const _item = __item(key, obj[key], deep + 1, _path)

        // if item is discarded by filtering
        if (!_item) {
          continue
        }

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

      const _spacing0 = __spacing(deep)
      const _spacing1 = _spacing0 + options.spacing

      const _out = []
      for (let i = 0; i < array.length; i++) {
        const _path = path + '#' + i
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

    if ((options.discard || options.compress) && (value === undefined || value === null)) {
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

if (typeof module !== 'undefined' && module.exports) {
  module.exports = stringify
}
