const constants = require('./constants');
const _ = require('lodash');

class ContactInfo {

  constructor(params = {
    type: constants.ADDRESS_TYPE_PERSON,
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    mobilePhone: ''
  }) {

    if(params.type !== constants.ADDRESS_TYPE_COMPANY && params.type !== constants.ADDRESS_TYPE_PERSON) {
      throw new Error(`Invalid address type '${params.type}'`);
    }

    Object.assign(this, _.pick(params, [
      'type', 'firstName', 'lastName', 'email', 'address', 'mobilePhone'
    ]));
  }

  toXmlData() {
    return {
      'address': {
        '@type': this.type,
        'first_name': this.firstName || '',
        'last_name': this.lastName || '',
        'email': this.email || '',
        'address': this.address || '',
        'mobile_phone': this.mobilePhone || '',
      }
    }
  }

  static xmlDataToAttributes(xmlData) {
    const attributes = {};
    const addressAttributes = xmlData['$'] || {};

    if(addressAttributes.type) {
      attributes.type = addressAttributes.type;
    }

    if(xmlData.address) {
      attributes.address = xmlData.address;
    }

    if(xmlData.email) {
      attributes.email = xmlData.email;
    }

    if(xmlData.first_name) {
      attributes.firstName = xmlData.first_name;
    }

    if(xmlData.last_name) {
      attributes.lastName = xmlData.last_name;
    }

    if(xmlData.mobile_phone) {
      attributes.moblePhone = xmlData.mobile_phone;
    }

    return attributes;
  }

  static fromXmlData(xmlData) {
    const attributes = this.xmlDataToAttributes(xmlData);

    return new ContactInfo(attributes);
  }
}

module.exports = ContactInfo;