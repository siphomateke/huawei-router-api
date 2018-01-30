'use strict';
import * as admin from './admin';
import * as config from './config';
import * as sms from './sms';
import * as ussd from './ussd';
import * as monitoring from './monitoring';
import * as utils from './utils';
import {RouterControllerError, RouterApiError, XhrError} from './error';

/**
 * Controls access to the router
 */
export default {
  admin: {
    getLoginState: admin.getLoginState,
    isLoggedIn: admin.isLoggedIn,
    login: admin.login,
  },
  config: config,
  sms: {
    types: sms.types,
    boxTypes: sms.boxTypes,
    parse: sms.parse,
    getSmsCount: sms.getSmsCount,
    getSmsList: sms.getSmsList,
    getFullSmsList: sms.getFullSmsList,
    setSmsAsRead: sms.setSmsAsRead,
    createSmsRequest: sms.createSmsRequest,
    saveSms: sms.saveSms,
    getSmsSendStatus: sms.getSmsSendStatus,
    sendSms: sms.sendSms,
    deleteSms: sms.deleteSms,
  },
  ussd: {
    parse: ussd.parse,
    releaseUssd: ussd.releaseUssd,
    getUssdResult: ussd.getUssdResult,
    sendUssdCommand: ussd.sendUssdCommand,
  },
  monitoring: {
    getTrafficStatistics: monitoring.getTrafficStatistics,
  },
  utils: {
    ping: utils.ping,
  },
  RouterControllerError,
  RouterApiError,
  XhrError,
};
