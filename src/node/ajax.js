'use strict';
import {
  XhrError,
} from '@/error';
import request from 'request-promise-native';
import xml2js from 'xml2js';

/**
 * @typedef xhrRequestOptions
 * @property {string} url
 * @property {string} [mimeType]
 * @property {string} [responseType]
 * @property {string} [method]
 * @property {object} [data]
 * @property {Object.<string, string>} [requestHeaders]
 */

/**
 *
 * @param {xhrRequestOptions} options
 * @return {Promise<string>}
 */
function xhrRequest(options) {
  return request({
    url: options.url,
    method: options.method,
    headers: options.requestHeaders
  });
}

/**
 *
 * @param {xhrRequestOptions} xhrOptions
 * @return {Promise<XMLHttpRequest>}
 */
function xhrRequestXml(xhrOptions) {
  xhrOptions = Object.assign({
    mimeType: 'application/xml',
  }, xhrOptions);
  return new Promise((resolve, reject) => {
    xhrRequest(xhrOptions).then((str) => {
      xml2js.parseString(str, (err, data) => {
        if (err) {
          reject(new XhrError('xhr_invalid_xml', err));
        } else {
          resolve(data);
        }
      });
    });
  });
}
