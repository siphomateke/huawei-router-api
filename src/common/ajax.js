'use strict';
import {RouterError, throwApiError} from '@/error';
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
  return typeof ret === 'string' && ret.toLowerCase() === 'ok';
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
    throwApiError(rootValue.code, rootValue.message);
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
