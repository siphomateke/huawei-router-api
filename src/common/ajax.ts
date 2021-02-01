'use strict';
import { RouterError, throwApiError, RequestError, RequestErrorCode } from '@/error';
import config from '@/config';
import NodeRSA from 'node-rsa';
import xml2js from 'xml2js';
import axios, { AxiosResponse, AxiosError } from 'axios';
import axiosCookieJarSupport from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';

const jar = new CookieJar();

axiosCookieJarSupport(axios);

export type RequestHeaders = {
  [headerName: string]: string | undefined;
};

interface RequestOptions {
  url: string,
  method?: string,
  data?: any,
  headers?: RequestHeaders,
  accepts?: string,
  responseType?: string,
}

export async function request<T extends any>(options: RequestOptions): Promise<AxiosResponse<T>> {
  options = Object.assign({
    method: 'GET',
  }, options);
  if (options.accepts) {
    options.headers = Object.assign({
      'Accept': options.accepts,
    }, options.headers);
  }

  try {
    const response = await axios({
      withCredentials: true,
      jar,
      timeout: config.requestTimeout,
      validateStatus: function (status) {
        return status >= 200 && status < 400;
      },
      ...options,
    });
    return response;
  } catch (error) {
    let requestErrorCode: RequestErrorCode;
    let requestErrorMessage: string;
    if (error.response) {
      if (error.response.status === 408 || error.code === 'ECONNABORTED') {
        requestErrorCode = 'timeout';
        requestErrorMessage = 'HTTP request timed out.';
      } else {
        requestErrorCode = 'invalid_status';
        requestErrorMessage = 'HTTP request response status invalid; ' + error.response.status;
      }
    } else if (error.request) {
      requestErrorCode = 'no_response';
      requestErrorMessage = 'HTTP request was made but no response was received.';
    } else {
      requestErrorCode = 'error';
      requestErrorMessage = 'Unknown HTTP request error; ' + error.message;
    }
    let axiosErrorCode = '';
    if (error.code) {
      requestErrorMessage += `; Error code: ${axiosErrorCode}.`;
    }
    throw new RequestError(requestErrorCode, requestErrorMessage);
  }
}

export async function basicRequest(url: string) {
  const { data } = await request({ url });
  return data;
}

interface XmlRequestOptions extends RequestOptions { }

const xmlParser = new xml2js.Parser({ explicitArray: false });

/**
 * Converts an XML string to JSON
 */
async function parseXml(str: string): Promise<object> {
  return new Promise((resolve, reject) => {
    xmlParser.parseString(str, (err: any, result: object | undefined) => {
      if (err) {
        reject(err);
      }
      resolve(result);
    })
  })
}

export async function xmlRequest(options: XmlRequestOptions): Promise<{ data: object, headers: any }> {
  // FIXME: Fix this type
  const response = await <string>request({
    accepts: 'application/xml',
    ...options,
  });
  try {
    const data = await parseXml(response.data);
    return { data, headers: response.headers };
  } catch (e) {
    throw new RequestError('invalid_xml', e);
  }
}

export type AjaxOkResponse = 'ok';

/**
 * Checks if an ajax return is valid by checking if the response is 'ok'
 * @param ret The AJAX return
 * @return if the response is ok
 */
export function isAjaxReturnOk(ret: AjaxOkResponse|any): boolean {
  return typeof ret === 'string' && ret.toLowerCase() === 'ok';
}

// FIXME: Fix this type
interface XmlResponse {
  error?: {
    code: string,
    message: string,
  },
  [key: string]: AjaxOkResponse | any,
}

/**
 * @returns The processed XML response.
 */
export async function processXmlResponse(ret: XmlResponse, responseMustBeOk: boolean = false): Promise<AjaxOkResponse|any> {
  /** The name of the root XML element. */
  const root = Object.keys(ret)[0];
  /** Children of the root XML element. */
  const rootValue = ret[root];
  if (root !== 'error') {
    if (responseMustBeOk) {
      if (isAjaxReturnOk(rootValue)) {
        return rootValue;
      } else {
        throw new RouterError('xml_response_not_ok', ret);
      }
    } else {
      return rootValue;
    }
  } else {
    throwApiError(rootValue.code, rootValue.message);
  }
}

export async function doRSAEncrypt(str: string): Promise<string> {
  if (str === '') {
    return '';
  }
  const publicKey = await config.getPublicEncryptionKey();
  const key = new NodeRSA();
  key.importKey({
    n: new Buffer(publicKey.n),
    e: parseInt(publicKey.e, 16),
  }, 'components-public');
  return key.encrypt(str, 'hex');
}

const xmlBuilder = new xml2js.Builder({
  renderOpts: { pretty: false }
});

export function objectToXml(obj: object): string {
  return xmlBuilder.buildObject(obj);
}
