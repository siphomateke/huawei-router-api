'use strict';
import {RouterError} from '@/error';
import {URL} from 'url';

export function parseRouterUrl(url: string): URL {
  let parsedUrl = null;
  try {
    parsedUrl = new URL(url);
  } catch (e) {
    if (e instanceof TypeError) {
      throw new RouterError(
        'invalid_router_url', 'Invalid router page url: '+url);
    } else {
      throw e;
    }
  }
  return parsedUrl;
}

export function base64encode(str: string): string {
  return Buffer.from(str, 'binary').toString('base64');
}
