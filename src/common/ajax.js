'use strict';
import {
  RouterControllerError,
  RouterApiError,
  getRouterApiErrorName,
} from '@/error';
import * as config from '@/config';
import NodeRSA from 'node-rsa';
import jxon from 'jxon';

/**
 * Checks if an ajax return is valid by checking if the response is 'ok'
 * @private
 * @param   {object}  ret The AJAX return
 * @return {boolean} if the response is ok
 */
export function isAjaxReturnOk(ret) {
  return ret.toLowerCase() === 'ok';
}

/**
 *
 * @param {any} ret
 * @param {boolean} responseMustBeOk
 * @return {Promise<any>}
 */
export function processXmlResponse(ret, responseMustBeOk=false) {
  return new Promise((resolve, reject) => {
    const root = Object.keys(ret)[0];
    const rootValue = ret[root];
    if (root !== 'error') {
      if (responseMustBeOk) {
        if (isAjaxReturnOk(rootValue)) {
          resolve(rootValue);
        } else {
          return Promise.reject(new RouterControllerError(
            'xml_response_not_ok', ret));
        }
      } else {
        resolve(rootValue);
      }
    } else {
      const errorName = getRouterApiErrorName(rootValue.code);
      let message = errorName ? errorName : rootValue.code;
      message += ((rootValue.message) ? ' : ' + rootValue.message : '');
      reject(new RouterApiError(message));
    }
  });
}

export async function doRSAEncrypt(str) {
  if (str === '') {
    return '';
  }
  const publicKey = await config.getPublicEncryptionKey();
  const key = new NodeRSA();
  key.importKey({
    n: new Buffer(publicKey.n),
    e: parseInt(publicKey.e, 16),
  }, 'components-public');
  return key.encrypt(str, 'hex');
}

/**
 *
 * @param {object} obj
 * @return {string}
 */
export function objectToXml(obj) {
  return '<?xml version="1.0" encoding="UTF-8"?>'+jxon.jsToString(obj);
}
