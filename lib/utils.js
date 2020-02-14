const md5 = require('md5');
const uuid = require('uuid');
const fs = require('fs');
const _ = require('lodash');
const Promise = require('es6-promise').Promise;
const crypto = require('crypto');
const NodeRSA = require('node-rsa');

module.exports.getUniqueId = getUniqueId;
module.exports.encrypt = encrypt;
module.exports.decrypt = decrypt;

function getUniqueId() {
  return md5(uuid.v4());
}

function encrypt(message, options) {
  return new Promise((resolve, reject) => {

    try {

      const randomKey = crypto.randomBytes(16);

      const cipher = crypto.createCipheriv('rc4', new Buffer(randomKey), '');
      const sealedBuf = [];
      sealedBuf.push(cipher.update(new Buffer(message)));
      sealedBuf.push(cipher.final());

      // Passing length of buffers as second arg excludes 1 loop
      const sealed = Buffer.concat(sealedBuf, sealedBuf[0].length + sealedBuf[1].length);

      const encryptedKey = new NodeRSA(fs.readFileSync(options.publicKeyFile, {encoding: 'UTF-8'}), {
        encryptionScheme: 'pkcs1'
      }).encrypt(randomKey).toString('base64');

      resolve({
        key: encryptedKey,
        message: sealed.toString('base64'),
      });
    } catch (err) {
      reject(err);
    }
  });
}

function decrypt(message, options) {
  return new Promise((resolve, reject) => {
    try {
      const randomKey = new NodeRSA(fs.readFileSync(options.privateKeyFile, {encoding: 'UTF-8'}), {
        encryptionScheme: 'pkcs1'
      }).decrypt(options.key);

      const decipher = crypto.createDecipheriv('rc4', randomKey, '');
      const decrypted = decipher.update(message, 'base64', 'utf8') + decipher.final('utf8');
      
      resolve(decrypted);

    } catch (err) {
      reject(err);
    }
  });
}
