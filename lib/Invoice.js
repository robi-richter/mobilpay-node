const RequestError = require('./errors/RequestError');
const ContactInfo = require('./ContactInfo');
const _ = require('lodash');

class Invoice {

  constructor(params = {
    currency: 'RON',
    tokenId: null,
    panMasked: null,
    details: ''
  }) {

    if(!params) {
      throw new RequestError('Params object is required');
    }

    if (!params.amount) {
      throw new RequestError('Missing amount');
    }

    if (params.amount < 0.1 || params.amount > 99999) {
      throw new RequestError('Invalid amount value. A minimum of ' +
        '0.10 and a maximum of 99999 units are permitted ');
    }

    Object.assign(this, _.pick(params, [
      'currency', 'amount', 'customerId', 'tokenId', 'panMasked', 'details'
    ]));

    if(params.billingAddress) {
      this.billingAddress = new ContactInfo(params.billingAddress);
    }

    if(params.shippingAddress) {
      this.shippingAddress = new ContactInfo(params.shippingAddress);
    }
  }

  toXmlData() {
    const xml = {
      invoice: {
        '@currency': this.currency,
        '@amount': this.amount,
        '@customer_id': this.customerId,
        '@customer_type': 2,
        details: this.details || '',
      }
    };

    if(this.tokenId) {
      xml.invoice['@token_id'] = this.tokenId;
    }

    if (this.panMasked) {
      xml.invoice['@pan_masked'] = this.panMasked;
    }

    if(this.billingAddress || this.shippingAddress) {
      const contactInfo = {};

      if(this.billingAddress) {
        Object.assign(contactInfo, { 'billing': this.billingAddress.toXmlData().address });
      }

      if(this.shippingAddress) {
        Object.assign(contactInfo, { 'shipping': this.shippingAddress.toXmlData().address });
      }

      xml.invoice['contact_info'] = contactInfo;
    }

    return xml;
  }

  static xmlDataToAttributes(xmlData) {
    const attributes = {};
    const invoiceAttributes = xmlData['$'] || {};

    if(invoiceAttributes.amount) {
      attributes.amount = invoiceAttributes.amount;
    }

    if(invoiceAttributes.currency) {
      attributes.currency = invoiceAttributes.currency;
    }

    if(invoiceAttributes.customer_id) {
      attributes.customerId = invoiceAttributes.customer_id;
    }

    if(invoiceAttributes.token_id) {
      attributes.tokenId = invoiceAttributes.token_id;
    }

    if(invoiceAttributes.pan_masked) {
      attributes.panMasked = invoiceAttributes.pan_masked;
    }

    if(xmlData.details) {
      attributes.details = order['invoice'].details;
    }

    if(xmlData.contact_info && _.isFunction(ContactInfo.xmlDataToAttributes)) {
      if(xmlData.contact_info.billing) {
        Object.assign(
          attributes, {
            billingAddress:
              ContactInfo.xmlDataToAttributes(xmlData.contact_info.billing)
          }
        );
      }

      if(xmlData.contact_info.shipping) {
        Object.assign(
          attributes, {
            shippingAddress:
              ContactInfo.xmlDataToAttributes(xmlData.contact_info.shipping)
          }
        );
      }
    }

    return attributes;
  }

  static fromXmlData(xmlData) {
    const attributes = this.xmlDataToAttributes(xmlData);

    return new Invoice(attributes);
  }
}

module.exports = Invoice;
