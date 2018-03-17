'use strict';
import * as ajax from '@/ajax';
import * as utils from '@/utils';

class ApiConfig {
  /**
   * @typedef ApiConfigOptions
   * @property {function} [map]
   * @property {function} [converter]
   */

  /**
   * @param {string} url
   * @param {ApiConfigOptions} options
   */
  constructor(url, options={}) {
    this.url = url;
    this.options = options;
  }

  async get() {
    const data = await ajax.getAjaxData({url: this.url});
    let processed = data;
    if (this.options.map) {
      processed = {};
      for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          processed[key] = this.options.map(data[key]);
        }
      }
    }
    if (this.options.converter) {
      processed = this.options.converter(processed);
    }
    return processed;
  }
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
 * @typedef PublicKey
 * @property {string} n
 * @property {string} e
 */

/**
 * @typedef EncryptionConfig
 * @property {PublicKey} publicKey Public RSA keys
 */

// TODO: Investigate what cbschannellist contains in SmsConfig. It's probably an array
/**
 * @typedef SmsConfig
 * @property {any} cbschannellist
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
 * @typedef UssdConfig
 * @property {UssdConfigGeneral} General
 */

/** @type {Object.<string, ApiConfig>}*/
let apiConfigs = {
  module: new ApiConfig('api/global/module-switch', {map: item => item === 1}),
  sms: new ApiConfig('config/sms/config.xml', {
    converter: data => {
      const processed = {};
      for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          if (key.toLowerCase() !== 'cbschannellist') {
            processed[key] = parseInt(data[key], 10);
          } else {
            processed[key] = data[key];
          }
        }
      }
      return processed;
    },
  }),
  prepaidussd: new ApiConfig('config/ussd/prepaidussd.xml'),
  postpaidussd: new ApiConfig('config/ussd/postpaidussd.xml'),
  enc: new ApiConfig('api/webserver/publickey', {
    converter: data => {
      return {publicKey: {n: data.encpubkeyn, e: data.encpubkeye}};
    },
  }),
};

export default {
  username: null,
  password: null,
  url: null,
  parsedUrl: null,
  ussdWaitInterval: 1000,
  ussdTimeout: 20000,
  api: {
    /** @type {ConfigModuleSwitch} */
    module: null,
    /** @type {EncryptionConfig} */
    encryption: {
      publicKey: null,
    },
    /** @type {SmsConfig} */
    sms: null,
    ussd: {
      /** @type {UssdConfig} */
      prepaid: null,
      /** @type {UssdConfig} */
      postpaid: null,
    },
  },

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

  /**
   * @param {string} name The name of the config to retrieve
   * @param {boolean} fresh Set to true to refresh cached values
   * @return {Promise<any>}
   */
  async getConfig(name, fresh=false) {
    if (!this.api[name] || fresh) {
      this.api[name] = await apiConfigs[name].get();
    }
    return this.api[name];
  },

  /**
   * @return {Promise<ConfigModuleSwitch>}
   */
  async getModuleSwitch() {
    return this.getConfig('module');
  },

  /**
   * @return {Promise<PublicKey>}
   */
  async getPublicEncryptionKey() {
    return (await this.getConfig('enc')).publicKey;
  },

  /**
   * Get's SMS configuration
   * @return {Promise<SmsConfig>}
   */
  async getSmsConfig() {
    return this.getConfig('sms');
  },

  /**
   * Get's USSD configuration. Includes USSD commands.
   * @param {boolean} [postpaid=false] Whether to get the postpaid or prepaid config
   * @return {Promise<UssdConfig>}
   */
  async getUssdConfig(postpaid=false) {
    const paidType = postpaid ? 'postpaid' : 'prepaid';
    return (await this.getConfig(paidType + 'ussd')).USSD;
  },
};
