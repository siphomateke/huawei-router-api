'use strict';
import * as admin from '@/admin';
import config from '@/config';
import * as sms from '@/sms';
import * as ussd from '@/ussd';
import * as monitoring from '@/monitoring';
import * as utils from '@/utils';
import * as dialup from '@/dialup';
import {RouterError, RouterApiError, RequestError, isErrorInCategory} from '@/error';

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
    cancelSendSms: sms.cancelSendSms,
    deleteSms: sms.deleteSms,
    importMessages: sms.importMessages,
  },
  ussd: {
    parse: ussd.parse,
    releaseUssd: ussd.releaseUssd,
    UssdResultRequest: ussd.UssdResultRequest,
    sendUssdCommand: ussd.sendUssdCommand,
  },
  monitoring: {
    getTrafficStatistics: monitoring.getTrafficStatistics,
    checkNotifications: monitoring.checkNotifications,
    resetStatistics: monitoring.resetStatistics,
    getDataUsageSettings: monitoring.getDataUsageSettings,
    setDataUsageSettings: monitoring.setDataUsageSettings,
  },
  utils: {
    ping: utils.ping,
  },
  errors: {
    RouterError,
    RouterApiError,
    RequestError,
    isErrorInCategory,
  },
  dialup: {
    getAutoApn: dialup.getAutoApn,
    setAutoApn: dialup.setAutoApn,
    getMobileDataSwitch: dialup.getMobileDataSwitch,
    setMobileDataSwitch: dialup.setMobileDataSwitch,
    getConnection: dialup.getConnection,
    setConnection: dialup.setConnection,
    getProfiles: dialup.getProfiles,
    deleteProfile: dialup.deleteProfile,
    addProfile: dialup.addProfile,
    editProfile: dialup.editProfile,
    dial: dialup.dial,
    getFeatureSwitch: dialup.getFeatureSwitch,
  },
};
