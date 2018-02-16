'use strict';
import * as ajax from '@/ajax';
import config from '@/config';
import shajs from 'sha.js';
import promiseFinally from 'promise.prototype.finally';
import * as commonUtils from '$env/utils';

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
    promiseFinally(this.list[idx](), () => {
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
 * Sends a request for the router's global config
 * to determine if there is a connection
 * @param {string} [routerUrl='']
 * @return {Promise}
 */
export function ping(routerUrl='') {
  let parsedUrl;
  if (routerUrl) {
    parsedUrl = commonUtils.parseRouterUrl(routerUrl);
  } else {
    parsedUrl = config.getParsedUrl();
  }
  return ajax.ping(parsedUrl.origin);
}

export function sha256(str) {
  return shajs('sha256').update(str).digest('hex');
}

export * from '$env/utils';
