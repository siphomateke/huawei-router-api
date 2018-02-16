'use strict';
import {
  RouterError,
  RouterApiError,
  getRouterApiErrorName,
} from '@/error';
import config from '@/config';
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
export async function processXmlResponse(ret, responseMustBeOk=false) {
  const root = Object.keys(ret)[0];
  const rootValue = ret[root];
  if (root !== 'error') {
    if (responseMustBeOk) {
      if (isAjaxReturnOk(rootValue)) {
        return rootValue;
      } else {
        throw new RouterError(
          'xml_response_not_ok', ret);
      }
    } else {
      return rootValue;
    }
  } else {
    const errorName = getRouterApiErrorName(rootValue.code);
    let code = errorName ? errorName.toLowerCase() : rootValue.code
    let message = code;
    if (rootValue.message) message += ' : ' + rootValue.message;
    throw new RouterApiError(code, message);
  }
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
