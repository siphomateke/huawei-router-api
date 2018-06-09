'use strict';
import * as utils from '@/utils';
import config from '@/config';
import {RouterError} from '@/error';
import {
  processXmlResponse,
  objectToXml,
  doRSAEncrypt,
  isAjaxReturnOk,
} from '@/common/ajax';
import {
  xmlRequest,
  getTokensFromPage,
  basicRequest,
} from '$env/ajax';

/**
 * @typedef ResponseProcessorOptions
 * @property {function} [map]
 * @property {function} [converter]
 */

/**
 * Applies common conversions to AJAX responses
 * @param {object} response
 * @param {ResponseProcessorOptions} options
 * @return {object}
 */
function convertResponse(response, options) {
  let processed = response;
  if (options.map) {
    processed = {};
    for (const key in response) {
      if (Object.prototype.hasOwnProperty.call(response, key)) {
        processed[key] = options.map(response[key]);
      }
    }
  }
  if (options.converter) {
    processed = options.converter(processed);
  }
  return processed;
}

/**
 * @typedef GetAjaxDataOptions
 * @property {string} url The url to get ajax data from
 * @property {boolean} [responseMustBeOk]
 * @property {string} [routerUrl] The url of the router. E.g. http://192.168.8.1
 * @property {function} [converter]
 * @property {function} [map]
 */

/**
 *
 * @param {GetAjaxDataOptions} options
 * @return {Promise<any>}
 */
export async function getAjaxData(options) {
  let parsedUrl;
  if (options.routerUrl) {
    parsedUrl = utils.parseRouterUrl(options.routerUrl);
  } else {
    parsedUrl = config.getParsedUrl();
  }
  const _tokens = await getTokens();
  const headers = {};
  if (_tokens.length > 0) {
    headers['__RequestVerificationToken'] = _tokens[0];
  }
  const ret = await xmlRequest({
    url: parsedUrl.origin + '/' + options.url,
    headers,
  });
  try {
    const processed = await processXmlResponse(ret.data, options.responseMustBeOk);
    return convertResponse(processed, options);
  } catch (e) {
    if (e instanceof RouterError && e.code === 'api_wrong_token') {
      await refreshTokens();
      return getAjaxData(options);
    } else {
      throw e;
    }
  }
}

// TODO: Improve token storage
export let tokens = null;

/**
 * Gets verification tokens required for making admin requests and logging in
 * @return {Promise<string[]>}
 */
async function getRequestVerificationTokens() {
  const homeUrl = config.getParsedUrl().origin+'/'+'html/home.html';
  const tokens = await getTokensFromPage(homeUrl);
  if (tokens.length > 0) {
    return tokens;
  } else {
    const data = await getAjaxData({url: 'api/webserver/token'});
    return [data.token];
  }
}

export async function refreshTokens() {
  const _tokens = await getRequestVerificationTokens();
  tokens = _tokens;
}

/**
 *
 * @param {boolean} fresh Set to true to force getting new tokens instead of using cached ones
 * @return {Promise<string[]>}
 */
export async function getTokens(fresh=false) {
  if (!tokens || fresh) {
    await refreshTokens();
  }
  return tokens;
}

export function updateTokens(newTokens) {
  tokens = newTokens;
}

/**
 * Converts headers keys to lower case
 * @param {Object.<string, string>} headers
 * @return {Object.<string, string>}
 */
function headersToLowerCase(headers) {
  let lowerCaseHeaders = {};
  for (let header in headers) {
    if (headers.hasOwnProperty(header)) {
      lowerCaseHeaders[header.toLowerCase()] = headers[header];
    }
  }
  return lowerCaseHeaders;
}

const ajaxQueue = new utils.Queue();

/**
 * @typedef SaveAjaxDataOptions
 * @property {string} url The url to get ajax data from
 * @property {object} request The POST data to be sent as xml
 * @property {boolean} [responseMustBeOk]
 * @property {boolean} [enc] Whether the request should be encrypted
 * @property {boolean} [enp]
 * @property {function} [converter]
 * @property {function} [map]
 */

/**
 *
 * @param {SaveAjaxDataOptions} options
 * @return {Promise<any>}
 */
// TODO: Simplify this by splitting up
export function saveAjaxData(options) {
  return new Promise((resolve, reject) => {
    ajaxQueue.add(async () => {
      try {
        let tokens = await getTokens();
        // get copy of tokens to work with
        tokens = tokens.slice();
        const moduleSwitch = await config.getModuleSwitch();
        let xmlString = objectToXml({request: options.request});

        const headers = {};

        // TODO: Fix encryption
        if (options.enc && moduleSwitch.encrypt_enabled) {
          headers['encrypt_transmit'] = 'encrypt_transmit';
          xmlString = await doRSAEncrypt(xmlString);
        }

        // TODO: Add 'part_encrypt_transmit' header using data.enpstring

        if (tokens.length > 0) {
          headers['__RequestVerificationToken'] = tokens[0];
          tokens.splice(0, 1);
          updateTokens(tokens);
        }

        const ret = await xmlRequest({
          url: config.getParsedUrl().origin + '/' + options.url,
          method: 'POST',
          data: xmlString,
          headers,
        });
        try {
          const processed = await processXmlResponse(ret.data, options.responseMustBeOk);
          if (options.url === 'api/user/login' && tokens.length > 0) {
          // login success, empty token list
            tokens = [];
            updateTokens(tokens);
          }
          resolve(convertResponse(processed, options));
        } catch (e) {
          if (e instanceof RouterError && e.code === 'api_wrong_token') {
            await refreshTokens();
            saveAjaxData(options).then(resolve, reject);
          } else {
            reject(e);
          }
        } finally {
          // get new tokens
          const lowerCaseHeaders = headersToLowerCase(ret.headers);
          const token = lowerCaseHeaders['__requestverificationtoken'];
          const token1 = lowerCaseHeaders['__requestverificationtokenone'];
          const token2 = lowerCaseHeaders['__requestverificationtokentwo'];
          if (token1) {
            tokens.push(token1);
            if (token2) {
              tokens.push(token2);
            }
          } else if (token) {
            tokens.push(token);
          } else {
            reject(new RouterError(
              'ajax_no_tokens', 'Can not get response token'));
          }
          updateTokens(tokens);
        }
      } catch (e) {
        reject(e);
      }
    });
  });
}

export async function ping(url='') {
  await basicRequest(url);
}

export {isAjaxReturnOk, xmlRequest};
