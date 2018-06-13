'use strict';
import * as ajax from '@/ajax';
import * as utils from '@/utils';
import dotty from 'dotty';

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
      for (const key of Object.keys(data)) {
        processed[key] = this.options.map(data[key]);
      }
    }
    if (this.options.converter) {
      processed = this.options.converter(processed);
    }
    return processed;
  }
}

// TODO: Add config checks and throw errors

let apiConfigs = {
  module: new ApiConfig('api/global/module-switch', {map: item => item === '1'}),
  sms: new ApiConfig('config/sms/config.xml', {
    converter: data => {
      const processed = {};
      for (const key of Object.keys(data)) {
        if (key.toLowerCase() !== 'cbschannellist') {
          processed[key] = parseInt(data[key], 10);
        } else {
          processed[key] = data[key];
        }
      }
      return processed;
    },
  }),
  ussd: {
    prepaid: new ApiConfig('config/ussd/prepaidussd.xml'),
    postpaid: new ApiConfig('config/ussd/postpaidussd.xml'),
  },
  enc: new ApiConfig('api/webserver/publickey', {
    converter: data => {
      return {publicKey: {n: data.encpubkeyn, e: data.encpubkeye}};
    },
  }),
  dialup: {
    connection: new ApiConfig('api/dialup/connection', {
      converter: data => {
        return {
          RoamAutoConnectEnable: data.RoamAutoConnectEnable === '1',
          MaxIdelTime: parseInt(data.MaxIdelTime, 10),
          ConnectMode: parseInt(data.ConnectMode, 10),
          MTU: parseInt(data.MTU, 10),
          auto_dial_switch: data.auto_dial_switch === '1',
          pdp_always_on: data.pdp_always_on === '1',
        };
      },
    }),
    profiles: new ApiConfig('api/dialup/profiles', {
      converter: data => {
        let profiles = [];
        // TODO: Make sure this doesn't break when there is more than one profile
        for (const key of Object.keys(data.Profiles)) {
          const profile = data.Profiles[key];
          profiles.push({
            Index: parseInt(profile.Index, 10),
            IsValid: profile.IsValid === '1',
            Name: profile.Name,
            ApnIsStatic: profile.ApnIsStatic === '1',
            ApnName: profile.ApnName,
            DialupNum: profile.DialupNum,
            Username: profile.Username,
            Password: profile.Password,
            AuthMode: parseInt(profile.AuthMode, 10),
            IpIsStatic: profile.IpIsStatic === '1',
            IpAddress: profile.IpAddress,
            Ipv6Address: profile.Ipv6Address,
            DnsIsStatic: profile.DnsIsStatic === '1',
            PrimaryDns: profile.PrimaryDns,
            SecondaryDns: profile.SecondaryDns,
            PrimaryIpv6Dns: profile.PrimaryIpv6Dns,
            SecondaryIpv6Dns: profile.SecondaryIpv6Dns,
            ReadOnly: parseInt(profile.ReadOnly, 10),
            iptype: parseInt(profile.iptype, 10),
          });
        }
        return {
          CurrentProfile: parseInt(data.CurrentProfile, 10),
          Profiles: profiles,
        };
      },
    }),
    featureSwitch: new ApiConfig('api/dialup/dialup-feature-switch', {
      map: item => item === '1',
    }),
    connectMode: new ApiConfig('config/dialup/connectmode.xml', {
      converter: data => {
        return {
          ConnectMode: {
            Auto: data.ConnectMode.Auto === '1',
            Manual: data.ConnectMode.Manual === '1',
          },
          idle_time_enabled: parseInt(data.idle_time_enabled, 10),
        };
      },
    }),
  },
};

/*
These were missing from ConfigModuleSwitch when testing:

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

/**
 * @typedef DialupProfile
 * @property {number} Index 1
 * @property {boolean} IsValid 1
 * @property {string} Name PLAY
 * @property {boolean} ApnIsStatic 1
 * @property {string} ApnName internet
 * @property {string} DialupNum *99#
 * @property {string} Username
 * @property {string} Password
 * @property {number} AuthMode 2
 * @property {boolean} IpIsStatic 0
 * @property {string} IpAddress
 * @property {string} Ipv6Address
 * @property {boolean} DnsIsStatic 0
 * @property {string} PrimaryDns
 * @property {string} SecondaryDns
 * @property {string} PrimaryIpv6Dns
 * @property {string} SecondaryIpv6Dns
 * @property {number} ReadOnly 2
 * @property {number} iptype 2
 */

/**
 * @typedef DialupProfiles
 * @property {number} CurrentProfile
 * @property {DialupProfile[]} Profiles
 */

/**
 * @typedef DialupConnection
 * @property {boolean} RoamAutoConnectEnable
 * @property {number} MaxIdelTime e.g 600
 * @property {0|1|2} ConnectMode 0-auto, 1-manual, 2-combining on demand
 * @property {number} MTU e.g 1500, 1450
 * @property {boolean} auto_dial_switch
 * @property {boolean} pdp_always_on
 */

/**
 * @typedef DialupFeatureSwitch
 * @property {boolean} iptype_enabled
 * @property {boolean} auto_dial_enabled
 * @property {boolean} show_dns_setting
 */

/**
 * @typedef ConnectMode
 * @property {boolean} Auto
 * @property {boolean} Manual
 */

/**
 * @typedef ConnectModeConfig
 * @property {ConnectMode} ConnectMode
 * @property {number} idle_time_enabled
 */

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
    dialup: {
      /** @type {DialupConnection} */
      connection: null,
      /** @type {DialupProfiles} */
      profiles: null,
      /** @type {DialupFeatureSwitch} */
      featureSwitch: null,
      /** @type {ConnectModeConfig} */
      connectMode: null,
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

  setConfig(path, value) {
    dotty.put(this.api, path, value);
  },

  /**
   * @param {string} path The path of the config to retrieve. E.g. 'ussd.prepaid'
   * @param {boolean} fresh Set to true to refresh cached values
   * @return {Promise<any>}
   */
  async getConfig(path, fresh=false) {
    if (!dotty.exists(this.api, path) || dotty.get(this.api, path) === null || fresh) {
      this.setConfig(path, await dotty.get(apiConfigs, path).get());
    }
    return dotty.get(this.api, path);
  },

  /**
   * @return {Promise<ConfigModuleSwitch>}
   */
  getModuleSwitch() {
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
  getSmsConfig() {
    return this.getConfig('sms');
  },

  /**
   * Get's USSD configuration. Includes USSD commands.
   * @param {boolean} [postpaid=false] Whether to get the postpaid or prepaid config
   * @return {Promise<UssdConfig>}
   */
  async getUssdConfig(postpaid=false) {
    const paidType = postpaid ? 'postpaid' : 'prepaid';
    return (await this.getConfig('ussd.'+paidType)).USSD;
  },
};
