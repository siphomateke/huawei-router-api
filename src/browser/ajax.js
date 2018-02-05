'use strict';
import {
  RouterControllerError,
  RouterApiError,
  RequestError,
  getRouterApiErrorName,
} from '@/error';
import * as utils from '@/utils';
import * as config from '@/config';
import {
  processXmlResponse,
  doRSAEncrypt
} from '@/common/ajax';

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
      for (const header in options.requestHeaders) {
        if (Object.prototype.hasOwnProperty.call(options.requestHeaders, header)) {
          xhr.setRequestHeader(header, options.requestHeaders[header]);
        }
      }
    }
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 400) {
        resolve(xhr);
      } else {
        reject(new RequestError('http_request_invalid_status', 'HTTP request response status invalid; '+xhr.statusText));
      }
    };
    xhr.ontimeout = () => {
      reject(new RequestError('http_request_timeout', 'XHR timed out'));
    };
    xhr.onerror = (e) => {
      reject(new RequestError('http_request_error','Unknown HTTP request error; '+e));
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
export function xmlRequest(options) {
  const requestOptions = {
    mimeType: 'application/xml'
  };
  for (let key of xmlRequestOptionsKeys) {
    if (key in options) {
      requestOptions[key] = options[key];
    }
  }
  if ('headers' in options) requestOptions.requestHeaders = options.headers;
  return xhrRequest(requestOptions).then((xhr) => {
    if (xhr.responseXML instanceof Document) {
      return {
        data: xml2object(xhr.responseXML),
        headers: parseHeaders(xhr.getAllResponseHeaders())
      };
    } else {
      Promise.reject(new RequestError('http_request_invalid_xml',
        'Expected XML to be instance of Document. Response: ' + xhr.responseXML));
    }
  });
}

/**
 *
 * @param {Element} xml
 * @return {object}
 */
function recursiveXml2Object(xml) {
  if (xml.children.length > 0) {
    const obj = {};
    Array.prototype.forEach.call(xml.children, (el) => {
      const childObj = (el.children.length > 0) ? recursiveXml2Object(el) : el.textContent;
      const siblings = Array.prototype.filter.call(el.parentNode.children, function(child) {
        return child !== el;
      });
      // If there is more than one of these elements, then it's an array
      if (siblings.length > 0 && siblings[0].tagName == el.tagName) {
        if (!(el.tagName in obj)) {
          obj[el.tagName] = [];
        }
        obj[el.tagName].push(childObj);
        // Otherwise just store it normally
      } else {
        obj[el.tagName] = childObj;
      }
    });
    return obj;
  } else {
    return xml.textContent;
  }
}

/**
 *
 * @param {Document} xml
 * @return {object}
 */
function xml2object(xml) {
  const obj = {};
  obj[xml.documentElement.tagName] = recursiveXml2Object(xml.documentElement);
  return obj;
}

/**
 * Gets a page
 * @param {string} url
 * @return {Promise<Document>}
 */
function getPage(url) {
  return xhrRequest({
    url: url, responseType: 'document',
  }).then((xhr) => {
    return xhr.response;
  });
}

/**
 * Gets verification tokens required for making admin requests and logging in
 * @return {Promise<string[]>}
 */
export async function getTokensFromPage() {
  const doc = await getPage(config.getParsedUrl().origin+'/'+'html/home.html');
  const meta = doc.querySelectorAll('meta[name=csrf_token]');
  let requestVerificationTokens = [];
  for (let i=0; i < meta.length; i++) {
    requestVerificationTokens.push(meta[i].content);
  }
  return requestVerificationTokens;
}
