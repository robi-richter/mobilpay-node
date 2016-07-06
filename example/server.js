const express = require('express');
const nunjucks = require('express-nunjucks');
const app = express();
const bodyParser = require('body-parser');
const MobilPay = require('../lib/MobilPay');
const MerchantResponse = require('../lib/merchant/Response');
const constants = require('../lib/constants');

app.use(bodyParser.urlencoded({ extended: false }));
app.set('view engine', 'html');
app.set('views', __dirname + '/templates');

nunjucks.setup({
  // (default: true) controls if output with dangerous characters are escaped automatically.
  autoescape: true,
  // (default: false) throw errors when outputting a null/undefined value.
  throwOnUndefined: false,
  // (default: false) automatically remove trailing newlines from a block/tag.
  trimBlocks: false,
  // (default: false) automatically remove leading whitespace from a block/tag.
  lstripBlocks: false,
  // (default: false) if true, the system will automatically update templates when they are changed on the filesystem.
  watch: true,
  // (default: false) if true, the system will avoid using a cache and templates will be recompiled every single time.
  noCache: true,
  // (default: see nunjucks syntax) defines the syntax for nunjucks tags.
  tags: {}
}, app);

const mobilPay = new MobilPay({
  signature: '',
  sandbox: true,
  publicKeyFile: '',
  privateKeyFile: '',
});

app.get('/', (req, res) => {

    let paymentRequest = mobilPay.createRequest({
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

  mobilPay.prepareRedirectData(paymentRequest)
    .then((result) => {
      return res.render('index', {
        title: 'New payment',
        redirectUrl: result.url,
        envKey: result.envKey,
        data: result.data
      });
    })
    .catch((err) => {
      console.log(err);
    });
});

app.get('/return', (req, res) => {
  const orderId = req.query.orderId;

  return res.render('success', {
    title: 'Payment success',
    orderID: orderId
  });
});

app.get('/confirm', (req, res) => {
  const envKey = req.body.env_key;
  const data = req.body.data;

  mobilPay.handleGatewayResponse({envKey, data})
    .then((data) => {
      // check the response and send back an acknowledge message
      const response = new MerchantResponse({
        message: data.response.crc
      });

      return res.send(response.toXml());
    })
    .catch((err) => {
      return res.status(500).end();
    });
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});