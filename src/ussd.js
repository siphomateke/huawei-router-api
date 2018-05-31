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
export async function releaseUssd() {
  const ret = await ajax.getAjaxData({url: 'api/ussd/release'});
  if (ajax.isAjaxReturnOk(ret)) {
    return true;
  } else {
    throw new RouterError(
      'ussd_release_fail');
  }
}

export class UssdResultRequest {
  constructor() {
    this._elapsedTime = 0;
    this._cancelled = false;
  }
  cancel() {
    this._cancelled = true;
  }
  async _query() {
    try {
      const ret = await ajax.getAjaxData({
        url: 'api/ussd/get',
      });
      return ret;
    } catch (err) {
      if (err instanceof RouterApiError) {
        if (err.code === 'api_ussd_processing') {
          if (this._elapsedTime >= config.ussdTimeout) {
            await releaseUssd();
            throw new RouterError('ussd_timeout');
          }
          if (this._cancelled) {
            throw new RouterError('ussd_cancelled');
          }
          await utils.delay(config.ussdWaitInterval);
          this._elapsedTime += config.ussdWaitInterval;
          return this._query();
        } else if (err.code == 'api_ussd_timeout') {
          await releaseUssd();
          throw err;
        }
      } else {
        throw err;
      }
    }
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

/**
 * Checks if a USSD request is in progress
 * @return {Promise<boolean>}
 */
export function getUssdStatus() {
  return ajax.getAjaxData({
    url: 'api/ussd/status',
    converter: data => data.result === '1',
  });
}
