'use strict';
import moment from 'moment';
import * as ajax from '@/ajax';
import config from '@/config';
import {RouterError, throwApiError} from '@/error';

/**
 * @enum {string}
 */
export const types = {
  RECHARGE: 'recharge',
  DATA: 'data',
  DATA_PERCENT: 'data_percent',
  ACTIVATED: 'activated',
  DEPLETED: 'depleted',
  AD: 'ad',
};

/**
 * @enum {number}
 */
export const boxTypes = {
  INBOX: 1,
  SENT: 2,
  DRAFT: 3,
  TRASH: 4,
  SIM_INBOX: 5,
  SIM_SENT: 6,
  SIM_DRAFT: 7,
  MIX_INBOX: 8,
  MIX_SENT: 9,
  MIX_DRAFT: 10,
};

function arrayMatch(message, regExpMatch, mapFunc) {
  const data = message.match(regExpMatch);
  if (data) {
    return data.map(mapFunc);
  } else {
    return [];
  }
}
/**
 * @typedef SmsDataUsage
 * @property {number} amount
 * @property {string} unit
 */
/**
 * Get's data usage strings in the message
 * @param {string} message
 * @return {SmsDataUsage[]}
 */
function getDataUsage(message) {
  return arrayMatch(message, /(\d*)(\.*)(\d*)( *)mb/gi, element => {
    return {
      amount: parseFloat(element.replace(/( *)mb/i, '')),
      unit: 'MB',
    };
  });
}
function getExpiryDate(message) {
  return arrayMatch(
    message, /(\d+)-(\d+)-(\d+) (\d{2}):(\d{2}):(\d{2})/g,
    date => moment(date).valueOf());
}
function getMoney(message) {
  return arrayMatch(
    message, /(\d*)(\.*)(\d*)( *)kwacha/gi,
    element => parseFloat(element.replace(/( *)kwacha/i, '')));
}

function getPercent(message) {
  return arrayMatch(
    message, /\d+%/gi,
    element => parseFloat(element.replace(/%/, '')));
}

/**
 *
 * @param {object} info
 * @param {string} message
 * @return {types}
 */
function getType(info, message) {
  const adPhrases = [
    'spaka',
    'bonus',
    'congratulations',
    'songs', 'tunes', 'music',
    'subscribe',
    'enjoy',
    'watch tv', 'mtn tv plus', 'mtn tv+',
    'download',
    'call across all networks',
    'youtube',
    'borrow',
    'laugh',
    'app',
    'sport',
  ];
  let count = 0;
  for (const phrase of adPhrases) {
    if (message.toLowerCase().search(phrase) > -1) {
      count++;
    }
  }
  const ml = message.toLowerCase();
  /**
   * Examples:
   * - The recharged amount is 50.000 kwacha.Your current balance is 250.522 kwacha..With MTN everyone is a winner, Earn more Ni Zee points by RECHARGING NOW! Dial *1212#!
   */
  if (info.money.length >= 2 && ml.includes('recharged') && ml.includes('balance')) {
    return types.RECHARGE;
  }
  if (info.data.length > 0) {
    /**
     * Examples:
     * - Y'ello, you have used up 90% of your 10240 MB Data Bundle.
     */
    if (ml.search(/\d+%/) > 0) {
      return types.DATA_PERCENT;
    }
    /**
     * Examples:
     * - You have Data 6.78 MB Home Data Valid until 2017-01-27 00:00:00.CONGRATS! You have a chance to win a CAR! SMS WIN to 669! Cost K0.50. TCs apply
     * - Y'ello! You have 4559.28 MB MTN Home Day Data.
     */
    if (info.expires.length > 0 || (ml.includes('have') && ml.includes('data'))) {
      return types.DATA;
    }
  }
  /**
   * Examples:
   * - Y'ello! Your 10GB MTN Home Internet Bundle (Once-Off) has been activated successfully.
   */
  if (ml.includes('activated') &&
  (ml.includes('bundle') || ml.includes('activated successfully'))) {
    return types.ACTIVATED;
  }
  /**
   * Examples:
   * - Dear Customer, You have depleted your 10240 MB data bundle. Your main balance is K 0.6154. Dial *335# to buy another pack.
   * - You have used all your Data Bundle.Your main balance is K 10.5228.Dial *335# to purchase a Bundle Now.
   */
  if ((ml.includes('depleted') || ml.includes('used all')) && ml.includes('bundle')) {
    return types.DEPLETED;
  }
  return types.AD;
}
export function parse(message) {
  const info = {
    data: getDataUsage(message),
    expires: getExpiryDate(message),
    money: getMoney(message),
    percent: getPercent(message),
  };

  return Object.assign(info, {
    type: getType(info, message),
  });
}

// Separate

/**
 * @typedef SmsCount
 * @property {number} LocalUnread
 * @property {number} LocalInbox
 * @property {number} LocalOutbox
 * @property {number} LocalDraft
 * @property {number} LocalDeleted
 * @property {number} LocalTotal computed value
 * @property {number} SimUnread
 * @property {number} SimInbox
 * @property {number} SimOutbox
 * @property {number} SimDraft
 * @property {number} LocalMax
 * @property {number} SimMax
 * @property {number} [SimUsed]
 * @property {number} SimTotal equal to SimUsed if it exists, otherwise computed
 * @property {number} NewMsg
 */

/**
 * Gets the number of read and unread messages
 * @param {boolean} [includeComputed=true]
 * @return {Promise<SmsCount>}
 */
export async function getSmsCount(includeComputed=true) {
  const data = await ajax.getAjaxData({url: 'api/sms/sms-count'});
  const processed = {};
  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      processed[key] = parseInt(data[key], 10);
    }
  }
  if (includeComputed) {
    let simTotal;
    if ('SimUsed' in processed) {
      simTotal = processed.SimUsed;
    } else {
      simTotal = processed.SimInbox + processed.SimOutbox + processed.SimDraft;
    }
    processed.SimTotal = simTotal;
    let localTotal = processed.LocalInbox + processed.LocalOutbox + processed.LocalDraft + processed.LocalDeleted;
    processed.LocalTotal = localTotal;
  }
  return processed;
}

/**
 * @enum {number}
 */
export const SmstatTypes = {
  UNREAD: 0,
  READ: 1,
  SIM: 2,
  SENT: 3,
};

/**
 * @typedef Message
 * @property {number} Smstat Sms status? @see SmstatTypes
 * @property {number} Index
 * @property {string|number} Phone The phone number from which the SMS was sent
 * @property {string} Content The actual content of the SMS
 * @property {string} Date The date the SMS was received
 * @property {any} Sca
 * @property {number} SaveType
 * @property {number} Priority
 * @property {number} SmsType
 */

// TODO: Fix SmsBoxTypes JSDoc
/**
 * @typedef SmsListOptions
 * @property {number} [page=1]
 * @property {number} [perPage=20]
 * @property {number} [boxType=1] Which box to retreive. Can be Inbox(1), sent(2) or draft(3)
 * @property {('desc'|'asc')} [sortOrder=desc]
*/

/**
 * Get's the list of SMSs from the router
 * @param {SmsListOptions} options Options
 * @return {Promise<Message[]>}
 */
export async function getSmsList(options) {
  options = Object.assign({
    page: 1,
    perPage: 20,
    boxType: 1,
    sortOrder: 'desc',
  }, options);
  const data = await ajax.saveAjaxData({
    url: 'api/sms/sms-list',
    request: {
      PageIndex: options.page,
      ReadCount: options.perPage,
      BoxType: options.boxType,
      SortType: 0,
      Ascending: options.sortOrder === 'desc' ? 0 : 1,
      UnreadPreferred: 0,
    },
  });
  if (data.Count > 1) {
    return data.Messages.Message;
  } else if (data.Count > 0) {
    return [data.Messages.Message];
  } else {
    return [];
  }
}

/**
 * @typedef FilterSmsListOption
 * @property {number} minDate
 */

/**
 *
 * @param {FilterSmsListOption} options
 * @param {Message[]} list
 * @return {Message[]}
 */
function filterSmsList(options, list) {
  const filteredList = [];
  for (const message of list) {
    if (options && options.minDate) {
      if (moment(message.Date).valueOf() > options.minDate) {
        filteredList.push(message);
      }
    } else {
      filteredList.push(message);
    }
  }
  return filteredList;
}

/**
 * @typedef FullSmsListOptions
 * @property {number} total
 * @property {FilterSmsListOption} [filter]
 */

/**
 *
 * @param {FullSmsListOptions} options
 * @param {SmsListOptions} smsListOptions
 * @param {Message[]} list
 * @param {number} perPage
 * @param {number} total
 * @param {number} [page=1]
 * @return {Promise<Message[]>}
 */
async function getFullSmsListRecursive(
  options, smsListOptions, list, perPage, total, page=1) {
  smsListOptions.perPage = perPage;
  smsListOptions.page = page;
  const currentList = await getSmsList(smsListOptions);
  page++;

  if (options.filter) {
    list = list.concat(filterSmsList(options.filter, currentList));
  } else {
    list = list.concat(currentList);
  }

  // If a minimum date is given and the order is descending
  // then we can be efficient and stop queries once the date is
  // larger than the minimum date
  if (options.filter && options.filter.minDate && smsListOptions.sortOrder === 'desc') {
    const dateFilteredList = filterSmsList({minDate: options.filter.minDate}, currentList);
    // If the date filtered list does not match the list then
    // this is the last page we should check as anything later
    // will be older than the minimum date
    if (dateFilteredList.length !== currentList.length) {
      return list;
    }
  }

  // If we have not reached the end of the messages
  if (((page - 1) * perPage) < total) {
    return getFullSmsListRecursive(
      options, smsListOptions, list, perPage, total, page);
  } else {
    return list;
  }
}

/**
 *
 * @param {FullSmsListOptions} options
 * @param {SmsListOptions} [smsListOptions]
 * @return {Promise<Message[]>}
 */
export async function getFullSmsList(options, smsListOptions={}) {
  smsListOptions = Object.assign({
    sortOrder: 'desc',
  }, smsListOptions);

  options = Object.assign({
    total: 0,
    filter: null,
  }, options);

  if (options.total > 0) {
    const smsConfig = await config.getSmsConfig();
    const list = await getFullSmsListRecursive(
      options, smsListOptions, [], smsConfig.pagesize, options.total
    );
    return list;
  } else {
    return [];
  }
}

/**
 *
 * @param {number} idx The index of the SMS
 * @return {Promise<Boolean>}
 */
export function setSmsAsRead(idx) {
  return ajax.saveAjaxData({
    url: 'api/sms/set-read',
    request: {
      Index: idx,
    },
    responseMustBeOk: true,
  });
}

export function createSmsRequest(options) {
  options = Object.assign({
    index: -1,
    numbers: [],
    content: '',
  }, options);

  return {
    Index: options.index,
    Phones: {
      Phone: options.numbers,
    },
    Sca: '',
    Content: options.content,
    Length: options.content.length,
    // TODO: Add different text modes
    // SMS_TEXT_MODE_UCS2 = 0
    // SMS_TEXT_MODE_7BIT = 1
    // SMS_TEXT_MODE_8BIT = 2
    Reserved: 1,
    Date: moment(Date.now()).format('Y-M-D HH:mm:ss'),
  };
}

/**
 * @typedef SaveSmsOptions
 * @property {number} index The index of the  Only used for sending drafts
 * @property {string[]} numbers An array of numbers to send the sms to
 * @property {string} content The SMS body
 */

/**
 * Sends an sms or saves a draft
 * @param {SaveSmsOptions} options
 * @return {Promise<boolean>}
 */
// TODO: Find out what pb and cancelSendSms is in original router
export function saveSms(options) {
  return ajax.saveAjaxData({
    url: 'api/sms/save-sms',
    request: createSmsRequest(options),
    responseMustBeOk: true,
  });
}

/**
 * @typedef SmsSendStatus
 * @property {string} TotalCount
 * @property {string} CurIndex
 * @property {string} Phone
 * @property {string} SucPhone
 * @property {string} FailPhone
 */

/**
 * @return {Promise<SmsSendStatus>}
 */
export function getSmsSendStatus() {
  return ajax.getAjaxData({
    url: 'api/sms/send-status',
  });
}

/**
 * @typedef SendSmsOptions
 * @property {string[]} numbers An array of numbers to send the sms to
 * @property {string} content The SMS body
 */

/**
 * @param {SendSmsOptions} options
 * @return {Promise<SmsSendStatus>}
 */
export async function sendSms(options) {
  await ajax.saveAjaxData({
    url: 'api/sms/send-sms',
    request: createSmsRequest(options),
    responseMustBeOk: true,
  });
  return getSmsSendStatus();
}

/**
 * @return {Promise<SmsSendStatus>}
 */
export async function cancelSendSms() {
  await ajax.saveAjaxData({
    url: 'api/sms/cancel-send',
    request: 1,
    responseMustBeOk: true,
  });
  return getSmsSendStatus();
}

/**
 * Delete's all messages with the given indices
 * @param {number[]} indices An array of indices of messages
 * @return {Promise<any>}
 */
export function deleteSms(indices) {
  const request = {Index: indices};
  return ajax.saveAjaxData({
    url: 'api/sms/delete-sms',
    request: request,
    responseMustBeOk: true,
  });
}

/**
 * Checks if:
 * - importing is a feature of this router
 * - there are any messages to import
 * - there is enough space
 * @return {Promise<boolean>}
 * @throws {RouterError}
 */
export async function readyToImport() {
  const smsConfig = await config.getSmsConfig();
  if (!smsConfig.import_enabled) {
    throw new RouterError('sms_import_disabled');
  }
  const smsCount = await getSmsCount();
  if (smsCount.SimTotal == 0 ) {
    throw new RouterError('sms_import_sim_empty');
  }
  if (smsCount.LocalTotal >= smsCount.LocalMax) {
    throw new RouterError('sms_not_enough_space');
  }
  return true;
}

/**
 * @typedef importMessagesResponse
 * @property {number} successNumber
 * @property {number} failNumber
 */

/**
 * Import's messages from the sim card
 * @param {boolean} checkIfReady Whether to call readyToImport. Set this to false if you want to check if importing is ready on your own
 * @return {Promise<importMessagesResponse>}
 * @throws {RouterError}
 */
export async function importMessages(checkIfReady=true) {
  if (checkIfReady) {
    await readyToImport();
  }
  const data = await ajax.saveAjaxData({
    url: 'api/sms/backup-sim',
    request: {
      IsMove: 0,
      Date: moment(Date.now()).format('Y-M-D HH:mm:ss'),
    },
  });

  if ('SucNumber' in data && data.SucNumber !== '' &&
    'FailNumber' in data && data.FailNumber !== '') {
    const successNumber = parseInt(data.SucNumber, 10);
    const failNumber = parseInt(data.FailNumber, 10);
    if (data.Code.toLowerCase() === 'ok' || successNumber > 0) {
      return {successNumber, failNumber};
    } else {
      throwApiError(data.Code);
    }
  } else {
    throw new RouterError('sms_import_invalid_response', 'Number succeeded and failed were empty. Response was: ' + JSON.stringify(data));
  }
}
