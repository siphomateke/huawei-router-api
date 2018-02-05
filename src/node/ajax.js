'use strict';
import {
  XhrError,
} from '@/error';
import nodeRequest from 'request';
import xml2js from 'xml2js';

/**
 * @typedef requestOptions
 * @property {string} url
 * @property {string} [method]
 * @property {object} [data]
 * @property {Object.<string, string>} [headers]
 * @property {string} [accepts]
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
  options.headers = Object.assign({
    'Accept': options.accepts
  }, options.headers);
  return new Promise((resolve, reject) => {
    return nodeRequest({
      url: options.url,
      method: options.method,
      headers: options.headers,
      body: options.data
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
 * @param {requestOptions} options
 * @return {Promise<any>}
 */
function xmlRequest(options) {
  options = Object.assign({
    accepts: 'application/xml',
  }, options);
  return new Promise((resolve, reject) => {
    request(options).then(({response, body}) => {
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
