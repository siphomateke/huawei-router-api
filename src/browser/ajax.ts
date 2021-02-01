'use strict';
import {request} from '@/common/ajax';

async function getPage(url: string): Promise<Document> {
  const {data} = await request({
    url,
    responseType: 'document',
  });
  return data;
}

/**
 * Gets verification tokens required for making admin requests and logging in
 */
export async function getTokensFromPage(url: string): Promise<string[]> {
  const doc = await getPage(url);
  const meta = doc.querySelectorAll('meta[name=csrf_token]');
  let requestVerificationTokens = [];
  for (let i=0; i < meta.length; i++) {
    requestVerificationTokens.push(meta[i].content);
  }
  return requestVerificationTokens;
}
