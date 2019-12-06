/**
 * @typedef {Object} RequestData
 * @property {String} paymentType
 * @property {String} currency - Transaction currency
 * @property {String} signature - Unique key assigned to your seller account for the payment process
 * @property {String} confirmUrl - Callback URL where the payment
 *                                 gateway will post transaction status updates
 * @property {String} returnUrl -  A URL in your web application where the client
 *                                 will be redirected to once the payment is complete
 * @property {String} lang - If you wish to display the interface in a different language other than RO
 * @property {Number} amount - the amount to be processed
 * @property {Object} notify - notification object
 */

const utils = require('./../utils');
const constants = require('./../constants');
const RequestError = require('./../errors/RequestError');
const moment = require('moment');
const XmlBuilder = require('xmlbuilder');
const _ = require('lodash');

class BaseRequest {

  /**
   * @param {RequestData} options
   */
  constructor(options) {

    if(!options) {
      throw new RequestError('Params object is required');
    }

    if(!options.paymentType) {
      throw new RequestError('Empty payment type');
    }

    /**
     * We only support cart payment for now
     * @todo support transfer payment type
     */
    if(options.paymentType !== constants.PAYMENT_TYPE_CARD) {
      throw new RequestError(`Payment type '${options.paymentType}' not supported`);
    }

    if(!options.signature) {
      throw new RequestError(`Missing merchant signature`);
    }

    this.paymentType = options.paymentType;
    this.signature = options.signature;
    this.id = options.id || utils.getUniqueId();
    this.timestamp = moment().format('YYYYMMDDHHmmss');

    if (options.returnUrl) {
      this.returnUrl = options.returnUrl;
    }

    if (options.confirmUrl) {
      this.confirmUrl = options.confirmUrl;
    }

    this.params = options.params || null;
  }

  toXmlData() {
    const xmlData = {
      order: {
        '@type': this.paymentType,
        '@id': this.id,
        '@timestamp': this.timestamp,
        signature: this.signature,
        url: {}
      }
    };

    if (this.confirmUrl) {
      xmlData.order.url['confirm'] = this.confirmUrl;
    }

    if (this.returnUrl) {
      xmlData.order.url['return'] = this.returnUrl;
    }

    if (this.params && _.isObject(this.params) && !_.isEmpty(this.params)) {
      let params = [];
      _.forIn(this.params, (value, key) => {
        params.push({
          name: key,
          value,
        });
        xmlData.order['params'] = { param: params };
      });
    }

    return xmlData;
  }

  toXml() {
    return XmlBuilder.create(this.toXmlData()).end();
  }

  static xmlDataToAttributes(xmlData) {
    const attributes ={};

    if(xmlData.order) {
      let order = xmlData.order;
      let orderAttributes = order['$'];

      attributes.paymentType = orderAttributes.type;
      attributes.id = orderAttributes.id;
      attributes.timestamp = orderAttributes.timestamp;
      if(order.signature) {
        attributes.signature = order.signature;
      }

      if(order.confirm) {
        attributes.confirmUrl = order.confirm;
      }

      if(order.return) {
        attributes.returnUrl = order.return;
      }

      if(order.params) {
        let params = order.params.param;

        attributes.params = _.reduce(params, (result, item, key) => {
          result[item.name] = item.value;
          return result;
        }, {});
      }
    }
    return attributes;
  }
}

module.exports = BaseRequest;