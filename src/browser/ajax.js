'use strict';
import {
  RequestError,
} from '@/error';
import jxon from 'jxon';

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
 * @return {Promise<XMLHttpRequest>}
 */
function xhrRequest(options) {
  options = Object.assign({
    mimeType: null,
    responseType: null,
    method: 'GET',
    data: null,
    requestHeaders: null,
  }, options);
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(options.method, options.url, true);
    if (options.responseType) {
      xhr.responseType = options.responseType;
    }
    if (options.mimeType) {
      xhr.setRequestHeader('Accept', options.mimeType);
      xhr.overrideMimeType(options.mimeType);
    }
    if (options.requestHeaders) {
      for (const header of Object.keys(options.requestHeaders)) {
        xhr.setRequestHeader(header, options.requestHeaders[header]);
      }
    }
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 400) {
        resolve(xhr);
      } else {
        reject(new RequestError('invalid_status', 'HTTP request response status invalid; '+xhr.statusText));
      }
    };
    xhr.ontimeout = () => {
      reject(new RequestError('timeout', 'XHR timed out'));
    };
    xhr.onerror = () => {
      reject(new RequestError('error', 'Unknown HTTP request error.'));
    };
    xhr.send(options.data);
  });
}

/**
 * Parses a raw header string into an object
 * @param {string} headers
 * @return {object}
 */
function parseHeaders(headers) {
  const parsed = {};
  for (let line of headers.split('\n')) {
    if (line.length > 0) {
      const pair = line.split(':');
      parsed[pair[0]] = pair[1].trim();
    }
  }
  return parsed;
}

export async function basicRequest(url) {
  const {responseText} = await xhrRequest({url});
  return responseText;
}

// TODO: Find a better way to manage default arguments
const xmlRequestOptionsKeys = ['url', 'method', 'data'];

/**
 * @typedef xmlRequestOptions
 * @property {string} url
 * @property {string} [method]
 * @property {object} [data]
 * @property {Object.<string, string>} [headers]
 */

/**
 * @typedef xmlRequestResponse
 * @property {object} data
 * @property {Object.<string, string>} headers
 */

/**
 *
 * @param {xmlRequestOptions} options
 * @return {Promise<xmlRequestResponse>}
 */
export async function xmlRequest(options) {
  const requestOptions = {
    mimeType: 'application/xml',
  };
  for (let key of xmlRequestOptionsKeys) {
    if (key in options) {
      requestOptions[key] = options[key];
    }
  }
  if ('headers' in options) requestOptions.requestHeaders = options.headers;
  const xhr = await xhrRequest(requestOptions);
  if (xhr.responseXML instanceof Document) {
    return {
      data: jxon.xmlToJs(xhr.responseXML),
      headers: parseHeaders(xhr.getAllResponseHeaders()),
    };
  } else {
    throw new RequestError('invalid_xml',
      'Expected XML to be instance of Document. Response: ' + xhr.responseXML);
  }
}

/**
 * Gets a page
 * @param {string} url
 * @return {Promise<Document>}
 */
async function getPage(url) {
  const xhr = await xhrRequest({
    url: url, responseType: 'document',
  });
  return xhr.response;
}

/**
 * Gets verification tokens required for making admin requests and logging in
 * @param {string} url
 * @return {Promise<string[]>}
 */
export async function getTokensFromPage(url) {
  const doc = await getPage(url);
  const meta = doc.querySelectorAll('meta[name=csrf_token]');
  let requestVerificationTokens = [];
  for (let i=0; i < meta.length; i++) {
    requestVerificationTokens.push(meta[i].content);
  }
  return requestVerificationTokens;
}
