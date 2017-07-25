
const stringify = function (data, options) {
  var __done = []

  if (!endline && endline !== '') {
    endline = ''
  }

  const __replace = function (str, find, replace) {
    return str.split(find).join(replace)
  }

  const __checkCircular = function (val, path) {
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
      return '"' + __replace(obj, '"', '\\"') + '"'
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
    object: function (obj, spacing, deep, path) {
      if (!path) {
        path = '[Object]'
      }
      __checkCircular(obj, path)

      // spacing
      let _space = ' '
      let _len = spacing || 0
      if (typeof spacing === 'string') {
        _space = spacing
        _len = _space.length
      }
      let _spacing0 = ''
      let i = 0
      for (i = 0; i < (deep - 1) * _len; i++) {
        _spacing0 += _space
      }
      let _spacing1 = _spacing0
      for (i = 0; i < _len; i++) {
        _spacing1 += _space
      }

      let _out = ''
      for (let key in obj) {
        // strange key
        let _key = key.match(/^\w[\d\w_]*$/) ? key : '"' + __replace(key, '"', '\\"') + '"'
        let _path = path + '.' + key
        _out += ',' + endline + _spacing1 + _key + ':' + __main(obj[key], spacing, deep + 1, _path)
      }
      return '{' + _out.substr(1) + endline + _spacing0 + '}'
    },
    array: function (obj, spacing, deep, path) {
      if (!path) {
        path = '[Array]'
      }
      __checkCircular(obj, _path)

      const _out = []
      for (let i = 0; i < obj.length; i++) {
        let _path = path + '#' + i
        _out.push(__main(obj[i], spacing, deep, _path))
      }
      return '[' + _out.join(',') + ']'
    },
    date: function (obj) {
      return 'new Date("' + obj.toISOString() + '")'
    },
    regexp: function (obj) {
      return obj.toString()
    }

  }

  const __main = function (obj, spacing, deep, path) {
    if (!deep) deep = 1

    let _type = typeof obj
    if (_type === 'object') {
      if (obj instanceof Array) {
        _type = 'array'
      } else if (obj instanceof Date) {
        _type = 'date'
      } else if (obj instanceof RegExp) {
        _type = 'regexp'
      } else if (obj instanceof stringify.deferred) {
        _type = 'deferred'
      } else if (obj === null) {
        _type = 'null'
      }
    }

    return __serialize[_type](obj, spacing, deep, path)
  }

  if (name) {
    return 'var ' + name + ' = ' + __main(obj, spacing)
  } else {
    return __main(obj, spacing)
  }
}

stringify.deferred = function (val) {
  this.val = val
}
stringify.deferred.prototype.toString = function () {
  return this.val
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = stringify
}
