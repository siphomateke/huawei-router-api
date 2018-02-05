'use strict';
import * as ajax from '@/ajax';
import * as utils from '@/utils';

const config = {
  username: null,
  password: null,
  url: null,
  parsedUrl: null,
  module: null,
  /**
   * @property {object} publicKey
   * @property {string} publicKey.n
   * @property {string} publicKey.e
   */
  encryption: {
    publicKey: null,
  },
  sms: null,
};

export function setUrl(_url) {
  config.url = _url;
  config.parsedUrl = utils.parseRouterUrl(config.url);
}

export function setUsername(_username) {
  config.username = _username;
}

export function setPassword(_password) {
  config.password = _password;
}

export function getUsername() {
  return config.username;
}

export function getPassword() {
  return config.password;
}

export function getLoginDetails() {
  return {
    username: config.username,
    password: config.password,
  };
}

export function getUrl() {
  return config.url;
}

export function getParsedUrl() {
  return config.parsedUrl;
}

// TODO: Add config checks and throw errors

/*
'autoapn_enabled': g_feature.autoapn_enabled === '1',
'checklogin_enabled': g_feature.login === '1',
'ap_station_enabled': g_feature.ap_station_enabled === '1',
'voip_adcance_enable': voiceadvancesetting === '1',
*/

/**
 * @typedef ConfigModuleSwitch
 * @property {string} ussd_enabled
 * @property {string} bbou_enabled
 * @property {string} sms_enabled
 * @property {string} sdcard_enabled
 * @property {string} wifi_enabled
 * @property {string} statistic_enabled
 * @property {string} help_enabled
 * @property {string} stk_enabled
 * @property {string} pb_enabled
 * @property {string} dlna_enabled
 * @property {string} ota_enabled
 * @property {string} wifioffload_enabled
 * @property {string} cradle_enabled
 * @property {string} multssid_enable
 * @property {string} ipv6_enabled
 * @property {string} monthly_volume_enabled
 * @property {string} powersave_enabled
 * @property {string} sntp_enabled
 * @property {string} encrypt_enabled
 * @property {string} dataswitch_enabled
 * @property {string} ddns_enabled
 * @property {string} sambashare_enabled
 * @property {string} poweroff_enabled
 * @property {string} fw_macfilter_enabled
 * @property {string} ecomode_enabled
 * @property {string} zonetime_enabled
 * @property {string} diagnosis_enabled
 * @property {string} localupdate_enabled
 * @property {string} cbs_enabled
 * @property {string} voip_enabled
 * @property {string} qrcode_enabled
 * @property {string} charger_enbaled
 * @property {string} vpn_enabled
 * @property {string} cs_enable
 * @property {string} tr069_enabled
 * @property {string} antenna_enabled
 * @property {string} aclui_enabled
 * @property {string} static_route_enabled
 * @property {string} static_route6_enabled
 * @property {string} loginusername_enable
 */

/**
 * @typedef ConfigModuleSwitchBoolean
 * @property {boolean} ussd_enabled
 * @property {boolean} bbou_enabled
 * @property {boolean} sms_enabled
 * @property {boolean} sdcard_enabled
 * @property {boolean} wifi_enabled
 * @property {boolean} statistic_enabled
 * @property {boolean} help_enabled
 * @property {boolean} stk_enabled
 * @property {boolean} pb_enabled
 * @property {boolean} dlna_enabled
 * @property {boolean} ota_enabled
 * @property {boolean} wifioffload_enabled
 * @property {boolean} cradle_enabled
 * @property {boolean} multssid_enable
 * @property {boolean} ipv6_enabled
 * @property {boolean} monthly_volume_enabled
 * @property {boolean} powersave_enabled
 * @property {boolean} sntp_enabled
 * @property {boolean} encrypt_enabled
 * @property {boolean} dataswitch_enabled
 * @property {boolean} ddns_enabled
 * @property {boolean} sambashare_enabled
 * @property {boolean} poweroff_enabled
 * @property {boolean} fw_macfilter_enabled
 * @property {boolean} ecomode_enabled
 * @property {boolean} zonetime_enabled
 * @property {boolean} diagnosis_enabled
 * @property {boolean} localupdate_enabled
 * @property {boolean} cbs_enabled
 * @property {boolean} voip_enabled
 * @property {boolean} qrcode_enabled
 * @property {boolean} charger_enbaled
 * @property {boolean} vpn_enabled
 * @property {boolean} cs_enable
 * @property {boolean} tr069_enabled
 * @property {boolean} antenna_enabled
 * @property {boolean} aclui_enabled
 * @property {boolean} static_route_enabled
 * @property {boolean} static_route6_enabled
 * @property {boolean} loginusername_enable
 */

/**
 * @return {Promise<ConfigModuleSwitchBoolean>}
 */
export async function getModuleSwitch() {
  if (!config.module) {
    /** @type {ConfigModuleSwitch} */
    const data = await ajax.getAjaxData({url: 'api/global/module-switch'});
    config.module = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        config.module[key] = data[key] === '1';
      }
    }
  }
  return config.module;
}

/**
 * @typedef ApiWebserverPublicKey
 * @property {string} encpubkeyn
 * @property {string} encpubkeye
 */

export async function getPublicEncryptionKey() {
  if (!config.encryption.publicKey) {
    /**
     * @type {ApiWebserverPublicKey}
     */
    const data = await ajax.getAjaxData({url: 'api/webserver/publickey'});
    config.encryption.publicKey = {};
    config.encryption.publicKey.n = data.encpubkeyn;
    config.encryption.publicKey.e = data.encpubkeye;
    return config.encryption.publicKey;
  }
  return config.encryption.publicKey;
}

/**
 * @typedef SmsConfig
 * @property {number} cbsenable
 * @property {number} cdma_enabled
 * @property {number} enable
 * @property {number} getcontactenable
 * @property {number} import_enabled
 * @property {number} localmax
 * @property {number} maxphone
 * @property {number} pagesize
 * @property {number} session_sms_enabled
 * @property {number} sms_center_enabled
 * @property {number} sms_priority_enabled
 * @property {number} sms_validity_enabled
 * @property {number} smscharlang
 * @property {number} smscharmap
 * @property {number} smsfulltype
 * @property {number} url_enabled
 * @property {number} validity
 */

/**
 * Get's SMS configuration
 * @return {Promise<SmsConfig>}
 */
export async function getSmsConfig() {
  if (!config.sms) {
    const data = await ajax.getAjaxData({url: 'config/sms/config.xml'});
    config.sms = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        config.sms[key] = parseInt(data[key]);
      }
    }
  }
  return config.sms;
}

/**
 * @typedef UssdConfigMenuItem
 * @property {string} Name
 * @property {string} Command
 */

/**
 * @typedef UssdConfigMenu
 * @property {UssdConfigMenuItem[]} MenuItem
 */

/**
 * @typedef UssdConfigGeneral
 * @property {string} Action
 * @property {string} Description
 * @property {string} LimitText
 * @property {UssdConfigMenu} Menu
 * @property {string} Title
 */

/**
 * @typedef _UssdConfig
 * @property {UssdConfigGeneral} General
 */

/**
 * @typedef UssdConfig
 * @property {_UssdConfig} USSD
 */

/**
 * Get's USSD configuration. Includes USSD commands.
 * @param {boolean} [postpaid=false] Whether to get the postpaid or prepaid config
 * @return {Promise<UssdConfig>}
 */
export function getUssdConfig(postpaid=false) {
  let url = 'config/ussd/';
  url += postpaid ? 'postpaid' : 'prepaid';
  url += 'ussd.xml';
  return ajax.getAjaxData({url: url});
}
