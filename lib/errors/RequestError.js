const ExtendableError = require('./ExtendableError');

class RequestError extends ExtendableError {
  constructor(message) {
    super(message);
  }
}

module.exports = RequestError;