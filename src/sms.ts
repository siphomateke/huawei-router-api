'use strict';
import moment from 'moment';
import * as ajax from '@/ajax';
import config from '@/config';
import { RouterError, throwApiError } from '@/error';

export enum SmsType {
  RECHARGE = 'recharge',
  DATA = 'data',
  DATA_PERCENT = 'data_percent',
  ACTIVATED = 'activated',
  DEPLETED = 'depleted',
  AD = 'ad',
};

export enum BoxType {
  INBOX = 1,
  SENT = 2,
  DRAFT = 3,
  TRASH = 4,
  SIM_INBOX = 5,
  SIM_SENT = 6,
  SIM_DRAFT = 7,
  MIX_INBOX = 8,
  MIX_SENT = 9,
  MIX_DRAFT = 10,
};

function arrayMatch<T>(message: string, regExpMatch: string | RegExp, mapFunc: (item: string) => T): T[] {
  const data = message.match(regExpMatch);
  if (data) {
    return data.map(mapFunc);
  } else {
    return [];
  }
}
interface SmsDataUsage {
  amount: number;
  unit: string;
}
/**
 * Get's data usage strings in the message
 */
function getDataUsage(message: string): SmsDataUsage[] {
  return arrayMatch(message, /(\d*)(\.*)(\d*)( *)mb/gi, element => {
    return {
      amount: parseFloat(element.replace(/( *)mb/i, '')),
      unit: 'MB',
    };
  });
}
function getExpiryDate(message: string) {
  return arrayMatch(
    message, /(\d+)-(\d+)-(\d+) (\d{2}):(\d{2}):(\d{2})/g,
    date => moment(date).valueOf());
}
function getMoney(message: string) {
  return arrayMatch(
    message, /(\d*)(\.*)(\d*)( *)kwacha/gi,
    element => parseFloat(element.replace(/( *)kwacha/i, '')));
}

function getPercent(message: string) {
  return arrayMatch(
    message, /\d+%/gi,
    element => parseFloat(element.replace(/%/, '')));
}

interface MessageInfo {
  data: SmsDataUsage[],
  expires: number[],
  money: number[],
  percent: number[],
}

function getType(info: MessageInfo, message: string): SmsType {
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
    return SmsType.RECHARGE;
  }
  if (info.data.length > 0) {
    /**
     * Examples:
     * - Y'ello, you have used up 90% of your 10240 MB Data Bundle.
     */
    if (ml.search(/\d+%/) > 0) {
      return SmsType.DATA_PERCENT;
    }
    /**
     * Examples:
     * - You have Data 6.78 MB Home Data Valid until 2017-01-27 00:00:00.CONGRATS! You have a chance to win a CAR! SMS WIN to 669! Cost K0.50. TCs apply
     * - Y'ello! You have 4559.28 MB MTN Home Day Data.
     */
    if (info.expires.length > 0 || (ml.includes('have') && ml.includes('data'))) {
      return SmsType.DATA;
    }
  }
  /**
   * Examples:
   * - Y'ello! Your 10GB MTN Home Internet Bundle (Once-Off) has been activated successfully.
   */
  if (ml.includes('activated') &&
    (ml.includes('bundle') || ml.includes('activated successfully'))) {
    return SmsType.ACTIVATED;
  }
  /**
   * Examples:
   * - Dear Customer, You have depleted your 10240 MB data bundle. Your main balance is K 0.6154. Dial *335# to buy another pack.
   * - You have used all your Data Bundle.Your main balance is K 10.5228.Dial *335# to purchase a Bundle Now.
   */
  if ((ml.includes('depleted') || ml.includes('used all')) && ml.includes('bundle')) {
    return SmsType.DEPLETED;
  }
  return SmsType.AD;
}

interface ParsedMessage extends MessageInfo {
  type: SmsType;
}

export function parse(message: string): ParsedMessage {
  const info: MessageInfo = {
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

interface SmsCount {
  LocalUnread: number;
  LocalInbox: number;
  LocalOutbox: number;
  LocalDraft: number;
  LocalDeleted: number;
  /** computed value */
  LocalTotal: number;
  SimUnread: number;
  SimInbox: number;
  SimOutbox: number;
  SimDraft: number;
  LocalMax: number;
  SimMax: number;
  SimUsed?: number;
  /** equal to SimUsed if it exists, otherwise computed */
  SimTotal: number;
  NewMsg: number;
}

/**
 * Gets the number of read and unread messages
 */
export async function getSmsCount(includeComputed: boolean = true): Promise<SmsCount> {
  const data = await ajax.getAjaxData({ url: 'api/sms/sms-count' });
  const processed = {} as SmsCount;
  for (const key of Object.keys(data)) {
    processed[key] = parseInt(data[key], 10);
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

export enum SmstatTypes {
  UNREAD = 0,
  READ = 1,
  SIM = 2,
  SENT = 3,
};

interface Message {
  /** SMS state type */
  Smstat: SmstatTypes;
  Index: number;
  /** The phone number from which the SMS was sent */
  Phone: string | number;
  /** The actual content of the SMS */
  Content: string;
  /** The date the SMS was received */
  Date: string;
  Sca: any;
  SaveType: number;
  Priority: number;
  SmsType: number;
}

interface SmsListOptions {
  /** @default 1 */
  page?: number;
  /** @default 20 */
  perPage?: number;
  /**
   * Which box to retreive. Can be Inbox(1), sent(2) or draft(3)
   * @default 1
   */
  boxType?: BoxType;
  /** @default 'desc' */
  sortOrder?: ('desc' | 'asc');
}

/**
 * Gets the list of SMS messages from the router.
 * @param options Options
 */
export async function getSmsList(options: SmsListOptions): Promise<Message[]> {
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

interface FilterSmsListOption {
  minDate?: number;
  read?: boolean;
}

function filterSmsList(options: FilterSmsListOption, list: Message[]): Message[] {
  const filteredList = [];
  for (const message of list) {
    if (options && 'minDate' in options) {
      if (moment(message.Date).valueOf() > options.minDate) {
        filteredList.push(message);
      }
    } else if (options && 'read' in options) {
      const state = parseInt(message.Smstat, 10);
      if ((options.read && state === 1) || (!options.read && state === 0)) {
        filteredList.push(message);
      }
    } else {
      filteredList.push(message);
    }
  }
  return filteredList;
}

interface FullSmsListOptions {
  total: number;
  filter?: FilterSmsListOption;
}

async function getFullSmsListRecursive(
  options: FullSmsListOptions,
  smsListOptions: SmsListOptions,
  list: Message[],
  perPage: number,
  total: number,
  page: number = 1
): Promise<Message[]> {
  smsListOptions.perPage = perPage;
  smsListOptions.page = page;
  const currentList = await getSmsList(smsListOptions);
  page++;

  let processedList = [];
  if (options.filter) {
    processedList = filterSmsList(options.filter, currentList);
  } else {
    processedList = currentList;
  }

  const done = list.length;
  const remaining = total - done;
  processedList = processedList.slice(0, remaining);

  list = list.concat(processedList);

  // If a minimum date is given and the order is descending
  // then we can be efficient and stop queries once the date is
  // larger than the minimum date
  if (options.filter && options.filter.minDate && smsListOptions.sortOrder === 'desc') {
    const dateFilteredList = filterSmsList({ minDate: options.filter.minDate }, processedList);
    // If the date filtered list does not match the list then
    // this is the last page we should check as anything later
    // will be older than the minimum date
    if (dateFilteredList.length !== processedList.length) {
      return list;
    }
  }

  // If we have not reached the end of the messages
  // and this isn't the last page
  if (list.length < total && currentList.length > 0) {
    return getFullSmsListRecursive(
      options, smsListOptions, list, perPage, total, page);
  } else {
    return list;
  }
}

export async function getFullSmsList(
  options: FullSmsListOptions,
  smsListOptions: SmsListOptions = {}
): Promise<Message[]> {
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
 * @param idx The index of the SMS
 */
export function setSmsAsRead(idx: number) {
  return ajax.saveAjaxData({
    url: 'api/sms/set-read',
    request: {
      Index: idx,
    },
    responseMustBeOk: true,
  });
}

interface SendSmsOptions {
  /** An array of numbers to send the sms to */
  numbers: string[];
  /** The SMS body */
  content: string;
}

interface SmsRequestOptions extends SendSmsOptions {
  /** The index of the message. Only used for sending drafts */
  index?: number;
}
// FIXME: Type return
export function createSmsRequest(options: SmsRequestOptions) {
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
 * Sends an sms or saves a draft
 */
// TODO: Find out what pb and cancelSendSms is in original router
export function saveSms(options: SmsRequestOptions) {
  return ajax.saveAjaxData({
    url: 'api/sms/save-sms',
    request: createSmsRequest(options),
    responseMustBeOk: true,
  });
}

interface SmsSendStatus {
  TotalCount: string;
  CurIndex: string;
  Phone: string;
  SucPhone: string;
  FailPhone: string;
}

export function getSmsSendStatus(): Promise<SmsSendStatus> {
  return ajax.getAjaxData({
    url: 'api/sms/send-status',
  });
}

export async function sendSms(options: SendSmsOptions): Promise<SmsSendStatus> {
  await ajax.saveAjaxData({
    url: 'api/sms/send-sms',
    request: createSmsRequest(options),
    responseMustBeOk: true,
  });
  return getSmsSendStatus();
}

export async function cancelSendSms(): Promise<SmsSendStatus> {
  await ajax.saveAjaxData({
    url: 'api/sms/cancel-send',
    request: 1,
    responseMustBeOk: true,
  });
  return getSmsSendStatus();
}

/**
 * Deletes all messages with the given indices
 * @param indices An array of indices of messages
 */
export function deleteSms(indices: number[]) {
  const request = { Index: indices };
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
 * @throws {RouterError}
 */
export async function readyToImport(): Promise<boolean> {
  const smsConfig = await config.getSmsConfig();
  if (!smsConfig.import_enabled) {
    throw new RouterError('sms_import_disabled');
  }
  const smsCount = await getSmsCount();
  if (smsCount.SimTotal == 0) {
    throw new RouterError('sms_import_sim_empty');
  }
  if (smsCount.LocalTotal >= smsCount.LocalMax) {
    throw new RouterError('sms_not_enough_space');
  }
  return true;
}

interface ImportMessagesResponse {
  successNumber: number;
  failNumber: number;
}

/**
 * Import's messages from the sim card
 * @param checkIfReady Whether to call readyToImport. Set this to false if you want to check if importing is ready on your own
 * @throws {RouterError}
 */
export async function importMessages(checkIfReady: boolean = true): Promise<ImportMessagesResponse> {
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
      return { successNumber, failNumber };
    } else {
      throwApiError(data.Code);
    }
  } else {
    throw new RouterError('sms_import_invalid_response', 'Number succeeded and failed were empty. Response was: ' + JSON.stringify(data));
  }
}
