'use strict';
import {request} from '@/common/ajax';

/**
 * Gets a page
 * @param {string} url
 * @return {Promise<Document>}
 */
async function getPage(url) {
  const {data} = await request({
    url,
    responseType: 'document',
  });
  return data;
}

/**
 * Gets verification tokens required for making admin requests and logging in
 * @param {string} url
 * @return {Promise<string[]>}
 */
export async function getTokensFromPage(url) {
  const doc = await getPage(url);
  const meta = doc.querySelectorAll('meta[name=csrf_token]');
  let requestVerificationTokens = [];
  for (let i=0; i < meta.length; i++) {
    requestVerificationTokens.push(meta[i].content);
  }
  return requestVerificationTokens;
}
