'use strict';
import {
  XhrError,
} from '@/error';
import nodeRequest from 'request';
import xml2js from 'xml2js';

/**
 * @typedef requestOptions
 * @property {string} url
 * @property {string} [mimeType]
 * @property {string} [responseType]
 * @property {string} [method]
 * @property {object} [data]
 * @property {Object.<string, string>} [requestHeaders]
 */

/**
 * @typedef requestResponse
 * @property {nodeRequest.RequestResponse} response
 * @property {any} body
 */

/**
 *
 * @param {requestOptions} options
 * @return {Promise<requestResponse>}
 */
function request(options) {
  return new Promise((resolve, reject) => {
    return nodeRequest({
      url: options.url,
      method: options.method,
      headers: options.requestHeaders
    }, (error, response, body) => {
      if (error) {
        reject(error);
      } else if (response) {
        if (response.statusCode >= 200 && response.statusCode < 400) {
          resolve({response, body});
        } else {
          reject(new XhrError('xhr_invalid_status', 'XHR status invalid; '+response.statusMessage));
        }
      } else {
        reject(new XhrError('xhr_error','Unknown XHR error; '));
      }
    });
  });
}

/**
 *
 * @param {requestOptions} xhrOptions
 * @return {Promise<any>}
 */
function xmlRequest(xhrOptions) {
  xhrOptions = Object.assign({
    mimeType: 'application/xml',
  }, xhrOptions);
  return new Promise((resolve, reject) => {
    request(xhrOptions).then(({response, body}) => {
      xml2js.parseString(body, (err, data) => {
        if (err) {
          reject(new XhrError('xhr_invalid_xml', err));
        } else {
          resolve({data, headers: response.headers});
        }
      });
    });
  });
}
