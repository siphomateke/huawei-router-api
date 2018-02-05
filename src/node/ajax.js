'use strict';
import {
  XhrError,
} from '@/error';
import request from 'request';
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
 * @typedef xhrRequestResponse
 * @property {request.RequestResponse} response
 * @property {any} body
 */

/**
 *
 * @param {xhrRequestOptions} options
 * @return {Promise<xhrRequestResponse>}
 */
function xhrRequest(options) {
  return new Promise((resolve, reject) => {
    return request({
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
 * @param {xhrRequestOptions} xhrOptions
 * @return {Promise<any>}
 */
function xhrRequestXml(xhrOptions) {
  xhrOptions = Object.assign({
    mimeType: 'application/xml',
  }, xhrOptions);
  return new Promise((resolve, reject) => {
    xhrRequest(xhrOptions).then(({response, body}) => {
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
