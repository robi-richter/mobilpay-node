const constants = require('../constants');
const _ = require('lodash');
const XmlBuilder = require('xmlbuilder');

class Response {

  constructor(options) {
    if (!options) {
      throw new Error('Options object is required');
    }

    if (options.code) {
      if(!_.isNumber(options.code)) {
        throw new Error('Non numeric code value');
      }
      this.code = options.code;
    }

    if(options.type
      && (options.type === constants.CRC_ERROR_TYPE_TEMPORARY
      || options.type === constants.CRC_ERROR_TYPE_PERMANENT)) {

      this.type = options.type;
    }

    if(options.message) {
      this.messsage = options.message;
    }
  }

  toXmlData() {
    const xmlData = {
      crc: {
        '#text': this.messsage
      }
    };

    if(this.code) {
      xmlData.crc['@error_code'] = this.code
    }

    if(this.type) {
      xmlData.crc['@error_type'] = this.type
    }

    return xmlData;
  }

  toXml() {
    return XmlBuilder.create(this.toXmlData()).end();
  }
}

module.exports = Response;
