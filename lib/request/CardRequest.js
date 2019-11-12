const BaseRequest = require('./BaseRequest');
const Invoice = require('./../Invoice');
const RequestError = require('../errors/RequestError');
const constants = require('../constants');
const _ = require('lodash');

class CardRequest extends BaseRequest {
  constructor(params) {
    if(!params || typeof params === 'undefined') {
      throw new RequestError('Params object is required');
    }

    params.paymentType = constants.PAYMENT_TYPE_CARD;
    super(params);

    this.invoice = new Invoice(_.pick(params, [
      'amount', 'currency', 'customerId', 'tokenId', 'panMasked',
      'details', 'billingAddress', 'shippingAddress',
    ]));
  }

  toXmlData() {
    const xmlData = super.toXmlData();

    Object.assign(xmlData.order, this.invoice.toXmlData());

    return xmlData;
  }

  static xmlDataToAttributes(xmlData) {
    const attributes = super.xmlDataToAttributes(xmlData);
    const order = xmlData.order || null;

    if (order && order.invoice && _.isFunction(Invoice.xmlDataToAttributes)) {
      Object.assign(attributes, Invoice.xmlDataToAttributes(order.invoice));
    }

    return attributes;
  }

  static fromXmlData(xmlData) {
    const attributes = this.xmlDataToAttributes(xmlData);

    return new CardRequest(attributes);
  }
}

module.exports = CardRequest;
