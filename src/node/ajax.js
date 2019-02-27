'use strict';
import {basicRequest} from '@/common/ajax';
import {JSDOM} from 'jsdom';

/**
 * Gets verification tokens required for making admin requests and logging in
 * @param {string} url
 * @return {Promise<string[]>}
 */
export async function getTokensFromPage(url) {
  const data = await basicRequest(url);
  const doc = (new JSDOM(data)).window.document;
  const meta = doc.querySelectorAll('meta[name=csrf_token]');
  let requestVerificationTokens = [];
  for (let i=0; i < meta.length; i++) {
    requestVerificationTokens.push(meta[i].content);
  }
  return requestVerificationTokens;
}
