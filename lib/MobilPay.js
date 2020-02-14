/**
 * @typedef {Object} MobilPayConfig
 * @property {Number} serviceType
 * @property {String} paymentType
 * @property {String} publicKeyFile
 * @property {String} privateKeyFile
 * @property {Boolean} sandbox - Toggle sandbox mode
 * @property {String} currency - Transaction currency
 * @property {String} signature - Unique key assigned to your seller account for the payment process
 * @property {String} confirmUrl - Callback URL where the payment
 *                                 gateway will post transaction status updates
 * @property {String} returnUrl -  A URL in your web application where the client
 *                                 will be redirected to once the payment is complete
 * @property {String} lang - If you wish to display the interface in a different language other than RO
 */

const CardRequest = require('./request/CardRequest');
const RequestError = require('./errors/RequestError');
const constants = require('./constants');
const encrypt = require('./utils').encrypt;
const decrypt = require('./utils').decrypt;
const Promise = require('es6-promise').Promise;
const xml2js = require('xml2js');
const _ = require('lodash');
const Notify = require('./Notify');
const request = require('request');

class MobilPay {

  /**
   * @param {MobilPayConfig} config
   */
  constructor(config) {

    if (!config) {
      throw new Error('Config is required');
    }

    this.config = Object.assign({
      currency: 'RON',
      serviceType: constants.SERVICE_STANDARD_PAYMENT,
      paymentType: constants.PAYMENT_TYPE_CARD,
      sandbox: false,
      privateKeyFile: '',
      publicKeyFile: '',
    }, config);

    if (this.config.serviceType !== constants.SERVICE_STANDARD_PAYMENT &&
        this.config.serviceType !== constants.SERVICE_PREFILLED_CARD_DATA_PAYMENT) {
      throw new Error('Unsupported service type');
    }

    if (this.config.paymentType !== constants.PAYMENT_TYPE_CARD) {
      throw new Error('Unsupported payment type');
    }

    if(!this.config.signature) {
      throw new Error('Missing merchant signature');
    }
  }

  createRequest(data) {
    let params = data || {};

    params.paymentType = this.config.paymentType;
    params.signature = this.config.signature;
    params.returnUrl = this.config.returnUrl;
    params.currency = this.config.currency;

    if (params.paymentType === constants.PAYMENT_TYPE_CARD) {
      return new CardRequest(params);
    }

    throw new RequestError(`Payment type '${params.paymentType}' not supported`);
  }

  prepareRedirectData(request) {
    return new Promise((resolve, reject) => {
      const xml = request.toXml();

      encrypt(xml, { publicKeyFile: this.config.publicKeyFile})
        .then((result) => {
          resolve({
            'url': constants.REQUEST_ENDPOINTS[this.config.serviceType][this.config.sandbox ? constants.SANDBOX_MODE : constants.LIVE_MODE],
            'envKey': result.key,
            'data': result.message
          });
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  createSoapRequest({ body }) {
    return new Promise((resolve, reject) => {
      const url = constants.REQUEST_ENDPOINTS.SOAP_API[this.config.sandbox ? constants.SANDBOX_MODE : constants.LIVE_MODE];
      const builder = new xml2js.Builder();
      const xml = builder.buildObject({
        "soapenv:Envelope": {
          "$": {
            "xmlns:soapenv": "http://schemas.xmlsoap.org/soap/envelope/",
            "xmlns:pay": url
          },
          "soapenv:Body": body
        }
      })

      const options = {
        url: url,
        body: xml,
        headers: { 'Content-Type': 'text/xml' }
      }

      return request.post(options, (err, response, body) => {
        if (err) {
          return reject(err)
        }

        const parser = new xml2js.Parser({ explicitArray: false });
        parser.parseString(body, (err, parsedXML) => {
          if (err) {
            return reject(err);
          }

          const soapBody = parsedXML['SOAP-ENV:Envelope']['SOAP-ENV:Body'];

          // SOAP should response with statuses 2xx or 500 - https://www.w3.org/TR/2000/NOTE-SOAP-20000508/
          if (response.statusCode === 500) {
            const error = soapBody['SOAP-ENV:Fault']
            return reject(error)
          }
          
          return resolve(soapBody)
        })
      })
    })
  }

  getSessionId({ username, password }) {
    if (!username) {
      throw new Error('username is required');
    }

    if (!password) {
      throw new Error('password is required');
    }

    return new Promise((resolve, reject) => {
      const body = {
        "pay:logIn": {
          request: {
            username: username,
            password: password
          }
        }
      }

      return this.createSoapRequest({ body: body })
        .then(soapBody => {
          const sessionId = soapBody['ns1:logInResponse'].logInResult.id;

          return resolve({ sessionId: sessionId })
        }).catch(err => {
          reject(err)
        })
    })
  }

  creditInvoice({ sessionId, orderId, amount }) {
    if (!sessionId) {
      throw new Error('sessionId is required');
    }

    if (!this.config.signature) {
      throw new Error('signature is required');
    }

    if (!orderId) {
      throw new Error('orderId is required');
    }

    if (!amount) {
      throw new Error('amount is required');
    }

    if (amount < 0.1 || amount > 99999) {
      throw new Error('Invalid amount value. A minimum of ' +
        '0.10 and a maximum of 99999 units are permitted ');
    }

    return new Promise((resolve, reject) => {
      const body = {
        "pay:credit": {
          request: {
            sessionId: sessionId,
            sacId: this.config.signature,
            orderId: orderId,
            amount: amount
          }
        }
      }

      return this.createSoapRequest({ body: body })
        .then(soapBody => {
          const creditResult = soapBody['ns1:creditResponse'].creditResult;

          return resolve(creditResult)
        }).catch(err => {
          reject(err)
        })
    })
  }

  handleGatewayResponse({ envKey, data } = {}) {
    return new Promise((resolve, reject) => {
      decrypt(data, {
        privateKeyFile: this.config.privateKeyFile,
        key: envKey,
      })
        .then((data) => {
          const parser = new xml2js.Parser({ explicitArray: false });

          parser.parseString(data, (err, result) => {
            if(err) {
              return reject(err);
            }

            if (!result.order) {
              return reject(new Error('Invalid XML data'));
            }

            let notify = null;
            let order = null;

            if(result.order.mobilpay && _.isFunction(Notify.xmlDataToAttributes)) {
              notify = Notify.fromXmlData(result.order.mobilpay);
            }

            if(result.order['$'].type
              && result.order['$'].type == constants.PAYMENT_TYPE_CARD) {
              if(_.isFunction(CardRequest.fromXmlData)) {
                order = CardRequest.fromXmlData(result);
              }
            }

            resolve({
              order,
              response: notify
            });
          });
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
}

module.exports = MobilPay;
