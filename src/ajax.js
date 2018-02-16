'use strict';
import * as utils from '@/utils';
import config from '@/config';
import {RouterError} from '@/error';
import {
  processXmlResponse,
  objectToXml,
  doRSAEncrypt,
  isAjaxReturnOk
} from '@/common/ajax';
import {
  xmlRequest,
  getTokensFromPage,
  basicRequest
} from '$env/ajax';

/**
 * @typedef GetAjaxDataOptions
 * @property {string} url The url to get ajax data from
 * @property {boolean} [responseMustBeOk]
 * @property {string} [routerUrl] The url of the router. E.g. http://192.168.8.1
 */

/**
 *
 * @param {GetAjaxDataOptions} options
 * @return {Promise<any>}
 */
export function getAjaxData(options) {
  let parsedUrl;
  if (options.routerUrl) {
    parsedUrl = utils.parseRouterUrl(options.routerUrl);
  } else {
    parsedUrl = config.getParsedUrl();
  }
  return getTokens().then(tokens => {
    const headers = {};
    if (tokens.length > 0) {
      headers['__RequestVerificationToken'] = tokens[0];
    }
    return xmlRequest({
      url: parsedUrl.origin + '/' + options.url,
      headers,
    }).then(ret => processXmlResponse(ret.data, options.responseMustBeOk));
  });
}

// TODO: Improve token storage
export let tokens = null;

/**
 * Gets verification tokens required for making admin requests and logging in
 * @return {Promise<string[]>}
 */
async function getRequestVerificationTokens() {
  const tokens = await getTokensFromPage();
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
 * @return {Promise<string[]>}
 */
export function getTokens() {
  return new Promise((resolve, reject) => {
    // TODO: Determine why removing resolve breaks this
    if (tokens) {
      resolve(tokens);
    } else {
      return refreshTokens().then(() => {
        resolve(tokens);
      }).catch(e => {
        reject(e);
      });
    }
  });
}

export function updateTokens(newTokens) {
  tokens = newTokens;
}

const ajaxQueue = new utils.Queue();

/**
 * @typedef SaveAjaxDataOptions
 * @property {string} url The url to get ajax data from
 * @property {object} request The POST data to be sent as xml
 * @property {boolean} [responseMustBeOk]
 * @property {boolean} [enc] Whether the request should be encrypted
 * @property {boolean} [enp]
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
          resolve(processed);
        } catch(e) {
          reject(e);
        } finally {
          // get new tokens
          const token = ret.headers['__requestverificationtoken'];
          const token1 = ret.headers['__requestverificationtokenone'];
          const token2 = ret.headers['__requestverificationtokentwo'];
          if (token1) {
            tokens.push(token1);
            if (token2) {
              tokens.push(token2);
            }
          } else if (token) {
            tokens.push(token);
          } else {
            return Promise.reject(
              new RouterError(
                'ajax_no_tokens', 'Can not get response token'));
          }
          updateTokens(tokens);
        }
      } catch (err) {
        reject(err);
      }
    });
  });
}

export async function ping(url='') {
  await basicRequest(url);
}

export {isAjaxReturnOk, xmlRequest};
