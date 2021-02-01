'use strict';
import * as utils from '@/utils';
import config from '@/config';
import { RouterError } from '@/error';
import {
  processXmlResponse,
  objectToXml,
  doRSAEncrypt,
  isAjaxReturnOk,
  basicRequest,
  xmlRequest,
  RequestHeaders,
  AjaxOkResponse,
} from '@/common/ajax';
import { getTokensFromPage } from '$env/ajax';

type ConvertResponseFnResponseType = { [key: string]: any };
type ConverterFunction<R extends ConvertResponseFnResponseType, T> = (response: R) => T;
type MapFunction<R extends ConvertResponseFnResponseType, T> = (item: R[keyof R]) => T;

export interface ResponseProcessorOptions<
  Response,
  ConverterReturn,
  Converter extends ConverterFunction<Response, ConverterReturn>,
  MapperReturn,
  MapFn extends MapFunction<Response, MapperReturn>,
  > {
  map?: MapFn,
  converter?: Converter,
}

/**
 * Applies common conversions to AJAX responses
 */
// FIXME: Make the typings in this better
export function convertResponse<
  R extends ConvertResponseFnResponseType,
  ConverterFnReturn,
  ConverterFn,
  MapFnReturn,
  MapFn extends MapFunction<R, MapFnReturn>,
  T extends (ConverterFn extends undefined ? { [key in keyof R]: MapFnReturn } : ConverterFnReturn)
>(response: R, options: ResponseProcessorOptions<R, ConverterFnReturn, ConverterFn, MapFnReturn, MapFn>): T {
  let processed: T | R = response;
  if (typeof options.map !== 'undefined') {
    processed = {} as R;
    for (const key of Object.keys(response)) {
      processed[key] = options.map(response[key]);
    }
  }
  if (typeof options.converter !== 'undefined') {
    processed = options.converter(processed);
  }
  return processed;
}

const converted = convertResponse({ username: 'thomas', password: '12345678' }, {
  converter: response => response.username === 'thomas',
});

interface GetAjaxDataOptions<CR, C extends ConverterFunction<CR>> extends ResponseProcessorOptions<CR, C> {
  /** The url to get ajax data from */
  url: string;
  responseMustBeOk?: boolean;
  /** The url of the router.E.g.http://192.168.8.1 */
  routerUrl?: string;
}

interface DefaultAjaxHeaders extends RequestHeaders {
  __RequestVerificationToken?: string,
}

export async function getAjaxData<
  CR,
  C extends ConverterFunction<CR>,
  T extends (C extends undefined ? object : CR)
>(options: GetAjaxDataOptions<CR, C>): Promise<T> {
  let parsedUrl: URL;
  if (options.routerUrl) {
    parsedUrl = utils.parseRouterUrl(options.routerUrl);
  } else {
    parsedUrl = config.getParsedUrl();
  }
  const _tokens = await getTokens();
  const headers: DefaultAjaxHeaders = {};
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

export type VerificationToken = string;

// TODO: Improve token storage
export let tokens: VerificationToken[] | null = null;

/**
 * Gets verification tokens required for making admin requests and logging in
 * @return The verification tokens
 */
async function getRequestVerificationTokens(): Promise<VerificationToken[]> {
  const homeUrl = config.getParsedUrl().origin + '/' + 'html/home.html';
  const tokens = await getTokensFromPage(homeUrl);
  if (tokens.length > 0) {
    return tokens;
  } else {
    const data = await getAjaxData({ url: 'api/webserver/token' });
    return [data.token];
  }
}

export async function refreshTokens() {
  const _tokens = await getRequestVerificationTokens();
  tokens = _tokens;
}

/**
 *
 * @param fresh Set to true to force getting new tokens instead of using cached ones
 */
export async function getTokens(fresh: boolean = false): Promise<VerificationToken[]> {
  if (!tokens || fresh) {
    await refreshTokens();
  }
  if (tokens !== null) {
    return tokens;
  } else {
    // FIXME: Make this a proper error
    throw new Error('Login verification tokens missing');
  }
}

export function updateTokens(newTokens: VerificationToken[]) {
  tokens = newTokens;
}

/**
 * Converts headers keys to lower case
 */
function headersToLowerCase(headers: RequestHeaders): RequestHeaders {
  let lowerCaseHeaders = {} as RequestHeaders;
  for (let header of Object.keys(headers)) {
    lowerCaseHeaders[header.toLowerCase()] = headers[header];
  }
  return lowerCaseHeaders;
}

const ajaxQueue = new utils.Queue();

interface SaveAjaxDataOptions<ResponseMustBeOk extends boolean> extends ResponseProcessorOptions {
  /** The url to get ajax data from */
  url: string;
  /** The POST data to be sent as xml */
  request: any;
  responseMustBeOk?: ResponseMustBeOk;
  /** Whether the request should be encrypted */
  enc?: boolean;
  enp?: boolean;
}

// TODO: Simplify this by splitting up
export function saveAjaxData<
  ResponseMustBeOk extends boolean,
  R extends (ResponseMustBeOk extends true ? AjaxOkResponse : object)
>(options: SaveAjaxDataOptions<ResponseMustBeOk>): Promise<R> {
  return new Promise((resolve, reject) => {
    ajaxQueue.add(async () => {
      try {
        let tokens = await getTokens();
        // get copy of tokens to work with
        tokens = tokens.slice();
        const moduleSwitch = await config.getModuleSwitch();
        let xmlString = objectToXml({ request: options.request });

        const headers = {} as RequestHeaders;

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

export async function ping(url = '') {
  await basicRequest(url);
}

export { isAjaxReturnOk, xmlRequest };
