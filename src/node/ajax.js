'use strict';
import {
  RequestError,
} from '@/error';
import axios from 'axios';
import axiosCookieJarSupport from 'axios-cookiejar-support';
import {CookieJar} from 'tough-cookie';
import jxon from 'jxon';
import {JSDOM} from 'jsdom';

const jar = new CookieJar();

axiosCookieJarSupport(axios);

/**
 * @typedef requestOptions
 * @property {string} url
 * @property {string} [method]
 * @property {object} [data]
 * @property {Object.<string, string>} [headers]
 * @property {string} [accepts]
 */

/**
 *
 * @param {requestOptions} options
 * @return {Promise<import('axios').AxiosResponse>}
 */
async function request(options) {
  options = Object.assign({
    method: 'GET',
  }, options);
  if (options.accepts) {
    options.headers = Object.assign({
      'Accept': options.accepts,
    }, options.headers);
  }

  const response = await axios({
    withCredentials: true,
    jar,
    ...options,
  });
  if (response.status >= 200 && response.status < 400) {
    return response;
  } else {
    throw new RequestError('invalid_status', 'HTTP request response status invalid; '+response.statusMessage);
  }
}

export async function basicRequest(url) {
  const {data} = await request({url});
  return data;
}

/**
 * @typedef xmlRequestOptions
 * @property {string} url
 * @property {string} [method]
 * @property {object} [data]
 * @property {Object.<string, string>} [headers]
 */

/**
 *
 * @param {xmlRequestOptions} options
 * @return {Promise<any>}
 */
export async function xmlRequest(options) {
  const response = await request({
    accepts: 'application/xml',
    ...options,
  });
  try {
    const data = jxon.stringToJs(response.data);
    return {data, headers: response.headers};
  } catch (e) {
    throw new RequestError('invalid_xml', e);
  }
}

/**
 * Gets verification tokens required for making admin requests and logging in
 * @param {string} url
 * @return {Promise<string[]>}
 */
export async function getTokensFromPage(url) {
  const {data} = await request({url});
  const doc = (new JSDOM(data)).window.document;
  const meta = doc.querySelectorAll('meta[name=csrf_token]');
  let requestVerificationTokens = [];
  for (let i=0; i < meta.length; i++) {
    requestVerificationTokens.push(meta[i].content);
  }
  return requestVerificationTokens;
}
