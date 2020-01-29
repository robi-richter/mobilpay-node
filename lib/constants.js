const SERVICE_STANDARD_PAYMENT = 1;
const SERVICE_CVV_ONLY_PAYMENT = 2;
const SERVICE_PREFILLED_CARD_DATA_PAYMENT = 3;

const PAYMENT_TYPE_CARD = 'card';
const PAYMENT_TYPE_SMS = 'sms';
const PAYMENT_TYPE_TRANSFER = 'transfer';

const LIVE_MODE = 'live';
const SANDBOX_MODE = 'sandbox';

const REQUEST_ENDPOINTS = {
  [SERVICE_STANDARD_PAYMENT] :{
    [LIVE_MODE]: 'https://secure.mobilpay.ro',
    [SANDBOX_MODE]: 'http://sandboxsecure.mobilpay.ro'
  },
  [SERVICE_CVV_ONLY_PAYMENT] :{
    [LIVE_MODE]: 'https://secure.mobilpay.ro/card3',
    [SANDBOX_MODE]: 'http://sandboxsecure.mobilpay.ro/card3'
  },
  [SERVICE_PREFILLED_CARD_DATA_PAYMENT] :{
    [LIVE_MODE]: 'https://secure.mobilpay.ro/card4',
    [SANDBOX_MODE]: 'http://sandboxsecure.mobilpay.ro/card4'
  },
  SOAP_API: {
    [SANDBOX_MODE]: 'http://sandboxsecure.mobilpay.ro/api/payment2/',
    [LIVE_MODE]: 'https://secure.mobilpay.ro/api/payment2/'
  },
};

const ADDRESS_TYPE_COMPANY = 'company';
const ADDRESS_TYPE_PERSON = 'person';

const NOTIFY_ACTION_NEW = 'new';
const NOTIFY_ACTION_PAID_PENDING = 'paid_pending';
const NOTIFY_ACTION_CONFIRMED_PENDING = 'confirmed_pending';
const NOTIFY_ACTION_PAID = 'paid';
const NOTIFY_ACTION_CONFIRMED = 'confirmed';
const NOTIFY_ACTION_CREDIT = 'credit';
const NOTIFY_ACTION_CANCELED = 'canceled';

const VALID_NOTIFY_ACTIONS = [
  NOTIFY_ACTION_NEW,
  NOTIFY_ACTION_PAID_PENDING,
  NOTIFY_ACTION_CONFIRMED_PENDING,
  NOTIFY_ACTION_PAID,
  NOTIFY_ACTION_CONFIRMED,
  NOTIFY_ACTION_CREDIT,
  NOTIFY_ACTION_CANCELED
];

const CRC_ERROR_TYPE_TEMPORARY = 1;
const CRC_ERROR_TYPE_PERMANENT = 2;

// instant payment notification (IPN) error codes
const IPN_ERROR_APPROVED = 0; // approved
const IPN_ERROR_CARD_HAS_RISK = 16; // card has a risk (i.e. stolen card)
const IPN_ERROR_INCORRECT_CARD_NR = 17; // card number is incorrect
const IPN_ERROR_CARD_CLOSED = 18; // closed card
const IPN_ERROR_CARD_EXPIRED = 19; // card is expired
const IPN_ERROR_INSUFFICIENT_FUNDS = 20; // insufficient funds
const IPN_ERROR_INCORRECT_CVV2 = 21; // cVV2 code incorrect
const IPN_ERROR_ISSUER_UNAVAILABLE = 22; // issuer is unavailable
const IPN_ERROR_INCORRECT_AMOUNT = 32; // amount is incorrect
const IPN_ERROR_INCORRECT_CURRENCY = 33; // currency is incorrect
const IPN_ERROR_TRANSACTION_NOT_PERMITED = 34; // transaction not permitted to cardholder
const IPN_ERROR_TRANSACTION_DECLINED = 35; // transaction declined
const IPN_ERROR_TRANSACTION_REJECTED = 36; // transaction rejected by antifraud filters
const IPN_ERROR_TRANSACTION_DECLINED2 = 37; // transaction declined (breaking the law)
const IPN_ERROR_TRANSACTION_DECLINED3 = 38; // transaction declined
const IPN_ERROR_INVALID_REQUEST = 48; // invalid request
const IPN_ERROR_DUPLICATE_PREAUTH = 49; // duplicate PREAUTH
const IPN_ERROR_DUPLICATE_AUTH = 50; // duplicate PREAUTH
const IPN_ERROR_CAN_ONLY_CANCEL_PREAUTH = 51; // you can only CANCEL a preauth order
const IPN_ERROR_CAN_ONLY_CONFIRM_PREAUTH = 52; // you can only CONFIRM a preauth order
const IPN_ERROR_CAN_ONLY_CREDIT_CONFIRMED = 53; // you can only CREDIT a confirmed order
const IPN_ERROR_CREDIT_AMOUNT_TO_HIGHT = 54; // credit amount is higher than auth amount
const IPN_ERROR_CAPTURE_AMOUNT_TO_HIGHT = 55; // capture amount is higher than preauth amount
const IPN_ERROR_DUPLICATE_REQUEST = 56; // duplicate request
const IPN_ERROR_GENERIC = 99; // generic error

module.exports = {
  SERVICE_STANDARD_PAYMENT,
  SERVICE_CVV_ONLY_PAYMENT,
  SERVICE_PREFILLED_CARD_DATA_PAYMENT,
  PAYMENT_TYPE_CARD,
  PAYMENT_TYPE_SMS,
  LIVE_MODE,
  SANDBOX_MODE,
  REQUEST_ENDPOINTS,
  ADDRESS_TYPE_COMPANY,
  ADDRESS_TYPE_PERSON,
  VALID_NOTIFY_ACTIONS,
  CRC_ERROR_TYPE_TEMPORARY,
  CRC_ERROR_TYPE_PERMANENT,
  IPN_ERROR_APPROVED,
  IPN_ERROR_CARD_HAS_RISK,
  IPN_ERROR_INCORRECT_CARD_NR,
  IPN_ERROR_CARD_CLOSED,
  IPN_ERROR_CARD_EXPIRED,
  IPN_ERROR_INSUFFICIENT_FUNDS,
  IPN_ERROR_INCORRECT_CVV2,
  IPN_ERROR_ISSUER_UNAVAILABLE,
  IPN_ERROR_INCORRECT_AMOUNT,
  IPN_ERROR_INCORRECT_CURRENCY,
  IPN_ERROR_TRANSACTION_NOT_PERMITED,
  IPN_ERROR_TRANSACTION_DECLINED,
  IPN_ERROR_TRANSACTION_REJECTED,
  IPN_ERROR_TRANSACTION_DECLINED2,
  IPN_ERROR_TRANSACTION_DECLINED3,
  IPN_ERROR_INVALID_REQUEST,
  IPN_ERROR_DUPLICATE_PREAUTH,
  IPN_ERROR_DUPLICATE_AUTH,
  IPN_ERROR_CAN_ONLY_CANCEL_PREAUTH,
  IPN_ERROR_CAN_ONLY_CONFIRM_PREAUTH,
  IPN_ERROR_CAN_ONLY_CREDIT_CONFIRMED,
  IPN_ERROR_CREDIT_AMOUNT_TO_HIGHT,
  IPN_ERROR_CAPTURE_AMOUNT_TO_HIGHT,
  IPN_ERROR_DUPLICATE_REQUEST,
  IPN_ERROR_GENERIC,
};