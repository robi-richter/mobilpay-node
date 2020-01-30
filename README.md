# mobilpay-node

[![dependencies Status](https://david-dm.org/robi-richter/mobilpay-node/status.svg)](https://david-dm.org/robi-richter/mobilpay-node)
[![devDependencies Status](https://david-dm.org/robi-richter/mobilpay-node/dev-status.svg)](https://david-dm.org/robi-richter/mobilpay-node?type=dev)

## About
this is a lightweight NodeJs library to integrate MobilPay payment gateway in your projects.
Bare in mind that it's still **under development** and **does't support all the payment options**.
So, feel free to contribute ;)

## Usage

```javascript
var mobilpay = require('mobilpay-node');
var constants = mobilpay.constants;
```

Bare in mind that you need to extract the public key from the public certificate provided by Mobilpay

```bash
openssl x509 -pubkey -noout -in PUBLIC_CERTIFICATE_FILE.cer > PUBLIC_KEY.pem
```

Create Mobilpay instance
```javascript
// create Mobilpay instance

var MobilPay = new mobilpay.Mobilpay({
  signature: '',
  sandbox: true,
  publicKeyFile: '',
  privateKeyFile: '',
  serviceType: 1, // default value 
});
```

serviceType can take one of the following values:
- 1 (Standard payment)
- 3 (Payment with prefilled card data)


serviceType with value 2 is not yet implemented (Payment with CVV only)

Create a new payment request
```javascript
var paymentRequest = MobilPay.createRequest({
  amount: parseFloat(Math.round(Math.random() * 10000)/100).toFixed(2),
  customerId: '12345',
  billingAddress: {
    type: constants.ADDRESS_TYPE_PERSON,
    firstName: 'Damian',
    lastName: 'Gardner',
    email: 'damian.gardner@inbound.plus',
    address: '4793 College Street, Cluj-Napoca, Cluj',
    mobilePhone: '0722222222'
  },
  shippingAddress: {
    type: constants.ADDRESS_TYPE_PERSON,
    firstName: 'Damian',
    lastName: 'Gardner',
    email: 'damian.gardner@inbound.plus',
    address: '4793 College Street, Cluj-Napoca, Cluj',
    mobilePhone: '0722222222'
  },
  confirmUrl: 'http://mysite.local/confirm',
  returnUrl: 'http://mysite.local/return',
  params: {
    test1: 'test param 1',
    test2: 'test param 2',
  }
});
```

If the serviceType is 3, the paymentRequest from above should contain:
```
  tokenId: 'token id from mobilpay',
  panMasked: 'pan masked from mobilpay'
```

Prepare redirect data
```javascript
MobilPay.prepareRedirectData(paymentRequest)
  .then(function(result) {

    console.log(
      'Redirect URL: ' + result.url,
      'env_key: ' + result.envKey,
      'data: ' + result.data
    );

  })
  .catch(function(err) {
    console.log(err);
  });
```

With the prepared data render a form and display it to the client

```html
<form name="frmPaymentRedirect" method="post" action="{{ redirectUrl }}">
    <input type="hidden" name="env_key" value="{{ envKey }}"/>
    <input type="hidden" name="data" value="{{ data }}"/>
    <p>
        You will be redirected to a secure page on mobilpay.ro
    </p>
    <p>
        Click to continue <input type="submit" value="Submit">
    </p>
</form>
```

Mobilpay will POST notifications to your confirm URL which can be something
like this *http://mysite.local/confirm*. to handle these notifications you'll need
to add this pice of code your route handler
```javascript
mobilPay.handleGatewayResponse({
  envKey: 'content from env_key POST body',
  data: 'content from data POST body'
  })
  .then(function(data) {
    // check the response and send back an acknowledge message
    var response = new mobilpay.MerchantResponse({
      message: data.response.crc
    });

    // send response.toXml() as response
  })
  .catch(function(err) {
    // handle error case
  });
```

### Retrieve session id
In order to cancel a payment, you need a sessionId. `MobilPay.getSessionId()` method will return a promise that is resolved with an object that contains property sessionId:

```javascript
MobilPay.getSessionId({
  username: 'mobilpay.username',
  password: 'mobilpay.password'
  })
  .then(response => {
    console.log(response); // { sessionId: 'unique user session identifier'}
    const { sessionId } = response;
  })
  .catch(err => {
    // handle error case
    console.log(err)
  })
```

### Cancel a payment

```javascript
MobilPay.creditInvoice({
  sessionId: sessionId,
  orderId: '', // payment request id you want to credit
  amount: 10 // must be equal or less than the initial amount
})
  .then(response => console.log(response))
  .catch(err => console.log(err))
```