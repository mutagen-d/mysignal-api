const time = () => new Date().toISOString();

/**
 * @param {*} value 
 * @returns {boolean}
 */
const toBoolean = (value) => {
  switch (typeof value) {
    case 'boolean':
      return value;
    case 'string':
      switch (value.toLowerCase()) {
        case 'true':
        case '1':
        case 'yes':
          return true;
        case 'false':
        case '0':
        case 'no':
          return false;
      }
      return undefined;
    case 'number':
      return Boolean(value)
    case 'object':
      if (value && value.value) {
        return toBoolean(value.value)
      }
      return undefined;
    default:
      return value;
  }
}

class Logger {
  constructor(name) {
    this.name = name || Logger.name;
  }

  /** @private */
  call(method, ...args) {
    console[method](time(), `${method.toUpperCase()}`.padStart(5, ' '), `[${this.name}]`, ...args)
  }

  log(...args) {
    this.call('log', ...args)
  }

  error(...args) {
    this.call('error', ...args)
  }
}

module.exports = {
  time,
  toBoolean,
  Logger,
}