'use strict';
import { RouterError } from '@/error';

export function parseRouterUrl(url: string): URL {
  let parsedUrl: URL | null = null;
  try {
    parsedUrl = new URL(url);
  } catch (e) {
    if (e instanceof TypeError) {
      throw new RouterError(
        'invalid_router_url', 'Invalid router page url: ' + url);
    } else {
      throw e;
    }
  }
  return parsedUrl;
}

export function base64encode(str: string): string {
  return btoa(str);
}
