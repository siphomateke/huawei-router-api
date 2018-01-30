'use strict';
import {RouterControllerError} from './error';
import * as ajax from './ajax';

/**
 * A promise based queue
 */
export class Queue {
  constructor() {
    this.list = [];
  }
  /**
   * Runs a particular item in the queue
   * @param {number} idx
   */
  _runItem(idx) {
    this.list[idx]().finally(() => {
      this._onComplete();
    });
  }
  /**
   * Called when a promise in the queue is complete
   */
  _onComplete() {
    // Remove the completed item from the queue
    if (this.list.length > 0) {
      this.list.splice(0, 1);
    }
    // If there are is another item in the queue, run it
    if (this.list.length > 0) {
      this._runItem(0);
    }
  }
  /**
   * Adds a new promise to the queue
   * @param {function} func A function which returns a promise
   */
  add(func) {
    this.list.push(func);
    if (this.list.length === 1) {
      this._runItem(0);
    }
  }
}

/**
 * Promise version of setTimeout
 * @param {number} t
 * @return {Promise}
 */
export function delay(t) {
  return new Promise(function(resolve) {
    setTimeout(resolve, t);
  });
}

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
 * Sends a request for the router's global config
 * to determine if there is a connection
 * @param {string} [routerUrl='']
 * @return {Promise}
 */
export function ping(routerUrl='') {
  return ajax.getAjaxData({
    url: 'config/global/config.xml',
    routerUrl: routerUrl,
  });
}
