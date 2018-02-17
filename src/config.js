'use strict';
import * as ajax from '@/ajax';
import * as utils from '@/utils';

export default {
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
  ussdWaitInterval: 1000,
  ussdTimeout: 20000,

  setUrl(_url) {
    this.url = _url;
    this.parsedUrl = utils.parseRouterUrl(this.url);
  },

  setUsername(_username) {
    this.username = _username;
  },

  setPassword(_password) {
    this.password = _password;
  },

  getUsername() {
    return this.username;
  },

  getPassword() {
    return this.password;
  },

  getLoginDetails() {
    return {
      username: this.username,
      password: this.password,
    };
  },

  getUrl() {
    return this.url;
  },

  getParsedUrl() {
    return this.parsedUrl;
  },

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
  async getModuleSwitch() {
    if (!this.module) {
      /** @type {ConfigModuleSwitch} */
      const data = await ajax.getAjaxData({url: 'api/global/module-switch'});
      this.module = {};
      for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          this.module[key] = data[key] === '1';
        }
      }
    }
    return this.module;
  },

  /**
   * @typedef ApiWebserverPublicKey
   * @property {string} encpubkeyn
   * @property {string} encpubkeye
   */

  async getPublicEncryptionKey() {
    if (!this.encryption.publicKey) {
      /**
       * @type {ApiWebserverPublicKey}
       */
      const data = await ajax.getAjaxData({url: 'api/webserver/publickey'});
      this.encryption.publicKey = {};
      this.encryption.publicKey.n = data.encpubkeyn;
      this.encryption.publicKey.e = data.encpubkeye;
      return this.encryption.publicKey;
    }
    return this.encryption.publicKey;
  },

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
  async getSmsConfig() {
    if (!this.sms) {
      const data = await ajax.getAjaxData({url: 'config/sms/config.xml'});
      this.sms = {};
      for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          this.sms[key] = parseInt(data[key]);
        }
      }
    }
    return this.sms;
  },

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
  getUssdConfig(postpaid=false) {
    let url = 'config/ussd/';
    url += postpaid ? 'postpaid' : 'prepaid';
    url += 'ussd.xml';
    return ajax.getAjaxData({url: url});
  },
};
