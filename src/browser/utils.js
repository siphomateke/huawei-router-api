'use strict';
import {RouterControllerError} from '@/error';

/**
 *
 * @param {string} url
 * @return {URL}
 */
export function parseRouterUrl(url) {
  let parsedUrl = null;
  try {
    parsedUrl = new URL(url);
  } catch (e) {
    if (e instanceof TypeError) {
      throw new RouterControllerError(
        'invalid_router_url', 'Invalid router page url: '+url);
    } else {
      throw e;
    }
  }
  return parsedUrl;
}

/**
 *
 * @param {string} str
 * @return {string}
 */
export function base64encode(str) {
  return btoa(str);
}
