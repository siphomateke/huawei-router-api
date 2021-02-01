'use strict';
import {basicRequest} from '@/common/ajax';
import {JSDOM} from 'jsdom';
import { VerificationToken } from '@/ajax';

/**
 * Gets verification tokens required for making admin requests and logging in
 */
export async function getTokensFromPage(url: string): Promise<VerificationToken[]> {
  const data = await basicRequest(url);
  // FIXME: Give `doc` a type
  const doc = (new JSDOM(data)).window.document;
  const meta = doc.querySelectorAll('meta[name=csrf_token]');
  let requestVerificationTokens = [];
  for (let i=0; i < meta.length; i++) {
    requestVerificationTokens.push(meta[i].content);
  }
  return requestVerificationTokens;
}
