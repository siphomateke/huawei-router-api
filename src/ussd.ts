'use strict';
import {RouterError, RouterApiError} from '@/error';
import * as utils from '@/utils';
import * as ajax from '@/ajax';
import config from '@/config';

type ParsedUssdOptions = { [key: string]: string };

/**
 * Get's USSD options from a message string.
 * E.g
 * 1. WhatsApp pack
 * 2. Facebook pack
 * 3. Nightly bundle
 */
function getOptions(message: string): ParsedUssdOptions  {
  const foundOptions = message.match(/(^.|\n.)+\. (.+)/gi);
  const options = {} as ParsedUssdOptions;
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

/**
 * Parses a USSD message's main text and options.
 * @param message
 */
export function parse(message: string) {
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
 */
export async function releaseUssd(): Promise<boolean> {
  const ret = await ajax.getAjaxData({url: 'api/ussd/release'});
  if (ajax.isAjaxReturnOk(ret)) {
    return true;
  } else {
    throw new RouterError('ussd_release_fail');
  }
}

interface UssdResult {
  content: string;
}

export class UssdResultRequest {
  private elapsedTime: number = 0;
  private cancelled: boolean = false;
  cancel() {
    this.cancelled = true;
  }
  // FIXME: Fix return type
  private async query(): Promise<UssdResult> {
    try {
      const ret = await ajax.getAjaxData({
        url: 'api/ussd/get',
      });
      return ret;
    } catch (err) {
      if (err instanceof RouterApiError) {
        if (err.code === 'api_ussd_processing') {
          if (this.elapsedTime >= config.ussdTimeout) {
            await releaseUssd();
            throw new RouterError('ussd_timeout');
          }
          if (this.cancelled) {
            throw new RouterError('ussd_cancelled');
          }
          await utils.delay(config.ussdWaitInterval);
          this.elapsedTime += config.ussdWaitInterval;
          return this.query();
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
   * Get's the result of a USSD command. Waits for result
   */
  send() {
    return this.query();
  }
}

/**
 * Sends a USSD command to the router
 * @param command the command to send
 */
export function sendUssdCommand(command: string) {
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
 */
export function getUssdStatus() {
  return ajax.getAjaxData({
    url: 'api/ussd/status',
    converter: (data: object) => data.result === '1',
  });
}

getUssdStatus().then(response => {let x = response()});
