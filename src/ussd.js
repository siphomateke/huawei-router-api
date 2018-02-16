'use strict';
import {RouterError, RouterApiError} from '@/error';
import * as utils from '@/utils';
import * as ajax from '@/ajax';
import config from '@/config';

/**
 * Get's USSD options from a message string.
 * E.g
 * 1. WhatsApp pack
 * 2. Facebook pack
 * 3. Nightly bundle
 * @param {string} message
 * @return {Object.<string, string>}
 */
function getOptions(message) {
  const foundOptions = message.match(/(^.|\n.)+\. (.+)/gi);
  const options = {};
  if (foundOptions) {
    foundOptions.map(element => {
      const regExp = /((^.|\n.)+)\. /;
      const match = regExp.exec(element);
      const key = match[1].replace(/\n/, '');
      options[key] = element.replace(/(^.|\n.)+\. /i, '');
    });
  }
  return options;
}

export function parse(message) {
  const options = getOptions(message);
  let content = message;
  if (options) {
    content = content.replace(/(^.|\n.)+\.((.|\n)+)/i, '');
  }
  return {
    content: content,
    options: options,
  };
}

/**
 * Releases previous USSD result. Must be called after getting a USSD result.
 * @return {Promise<boolean>}
 */
export function releaseUssd() {
  return ajax.getAjaxData({url: 'api/ussd/release'}).then(ret => {
    if (ajax.isAjaxReturnOk(ret)) {
      return true;
    } else {
      return Promise.reject(new RouterError(
        'ussd_release_fail'));
    }
  });
}

export class UssdResultRequest {
  constructor() {
    this._elapsedTime = 0;
    this._cancelled = false;
  }
  cancel() {
    this._cancelled = true;
  }
  _query() {
    return ajax.getAjaxData({
      url: 'api/ussd/get',
    }).catch(err => {
      if (err instanceof RouterApiError && err.code === 'api_ussd_processing') {
        if (this._elapsedTime >= config.ussdTimeout) {
          return Promise.reject(new RouterError(
            'ussd_timeout'));
        }
        if (this._cancelled) {
          return Promise.reject(new RouterError('ussd_cancelled'));
        }
        return utils.delay(config.ussdWaitInterval).then(() => {
          this._elapsedTime += config.ussdWaitInterval;
          return this._query()
        });
      } else {
        releaseUssd();
        return Promise.reject(err);
      }
    });
  }
  /**
   * @typedef UssdResult
   * @property {string} content
   */

  /**
   * Get's the result of a USSD command. Waits for result
   * @return {Promise<UssdResult>}
   */
  send() {
    return this._query();
  }
}

/**
 * Sends a USSD command to the router
 * @param {string}   command  the command to send
 * @return {Promise<any>}
 */
export async function sendUssdCommand(command) {
  return ajax.saveAjaxData({
    url: 'api/ussd/send',
    request: {
      content: command,
      codeType: 'CodeType',
      timeout: '',
    },
    responseMustBeOk: true,
  });
}
