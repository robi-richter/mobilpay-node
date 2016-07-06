const xml2js = require('xml2js');
const ContactInfo = require('./ContactInfo');
const constants = require('./constants');
const _ = require('lodash');

class Notify {

  constructor(options) {
    if(!options) {
      throw new Error('Options object is required');
    }

    if(constants.VALID_NOTIFY_ACTIONS.indexOf(options.action) < 0) {
      throw new Error('Invalid action');
    }

    Object.assign(this, _.pick(options, ['timestamp', 'crc',
      'action', 'purchase', 'originalAmount', 'processedAmount',
      'currentPaymentCount', 'panMasked', 'paymentInstrumentId',
      'tokenId', 'tokenExpirationDate', 'errorCode', 'errorMessage'
    ]));

    if(options.customer) {
      this.customer = new ContactInfo(options.customer);
    }
  }

  static xmlDataToAttributes(xmlData) {
    const attributes = {};
    const notifyAttributes = xmlData['$'] || {};

    Object.assign(attributes, _.pick(notifyAttributes, ['timestamp', 'crc']));

    Object.assign(attributes,_.mapKeys(_.pick(xmlData, [
      'action', 'purchase', 'original_amount', 'processed_amount',
      'current_payment_count', 'pan_masked', 'payment_instrument_id',
      'token_id', 'token_expiration_date'
    ]), (value, key) => _.camelCase(key)));

    if(xmlData.customer) {
      Object.assign(
        attributes, {
          customer:
            ContactInfo.xmlDataToAttributes(xmlData.customer)
        }
      );
    }

    if(xmlData.error) {
      attributes.errorCode = xmlData.error['$'].code;
      attributes.errorMessage = xmlData.error['_'];
    }

    return attributes;
  }

  static fromXmlData(xmlData) {
    const attributes = this.xmlDataToAttributes(xmlData);

    return new Notify(attributes);
  }
}

module.exports = Notify;