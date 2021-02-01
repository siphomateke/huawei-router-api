'use strict';
import * as ajax from '@/ajax';
import * as utils from '@/utils';
import dotty from 'dotty';

interface ApiConfigOptions extends ajax.ResponseProcessorOptions {}

class ApiConfig {
  constructor(public url: string, public options: ApiConfigOptions = {}) {}

  async get() {
    const data = await ajax.getAjaxData({ url: this.url });
    return ajax.convertResponse(data, this.options);
  }
}

// TODO: Add config checks and throw errors

interface ApiConfigs {
  [key: string]: ApiConfigs | ApiConfig;
}

// FIXME: Make these type-safe
let apiConfigs: ApiConfigs = {
  module: new ApiConfig('api/global/module-switch', { map: item => item === '1' }),
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
      return { publicKey: { n: data.encpubkeyn, e: data.encpubkeye } };
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

interface ConfigModuleSwitch {
  ussd_enabled: boolean;
  bbou_enabled: boolean;
  sms_enabled: boolean;
  sdcard_enabled: boolean;
  wifi_enabled: boolean;
  statistic_enabled: boolean;
  help_enabled: boolean;
  stk_enabled: boolean;
  pb_enabled: boolean;
  dlna_enabled: boolean;
  ota_enabled: boolean;
  wifioffload_enabled: boolean;
  cradle_enabled: boolean;
  multssid_enable: boolean;
  ipv6_enabled: boolean;
  monthly_volume_enabled: boolean;
  powersave_enabled: boolean;
  sntp_enabled: boolean;
  encrypt_enabled: boolean;
  dataswitch_enabled: boolean;
  ddns_enabled: boolean;
  sambashare_enabled: boolean;
  poweroff_enabled: boolean;
  fw_macfilter_enabled: boolean;
  ecomode_enabled: boolean;
  zonetime_enabled: boolean;
  diagnosis_enabled: boolean;
  localupdate_enabled: boolean;
  cbs_enabled: boolean;
  voip_enabled: boolean;
  qrcode_enabled: boolean;
  charger_enbaled: boolean;
  vpn_enabled: boolean;
  cs_enable: boolean;
  tr069_enabled: boolean;
  antenna_enabled: boolean;
  aclui_enabled: boolean;
  static_route_enabled: boolean;
  static_route6_enabled: boolean;
  loginusername_enable: boolean;
}

interface PublicKey {
  n: string;
  e: string;
}

// TODO: Investigate what cbschannellist contains in SmsConfig. It's probably an array
interface SmsConfig {
  cbschannellist: any;
  cbsenable: number;
  cdma_enabled: number;
  enable: number;
  getcontactenable: number;
  import_enabled: number;
  localmax: number;
  maxphone: number;
  pagesize: number;
  session_sms_enabled: number;
  sms_center_enabled: number;
  sms_priority_enabled: number;
  sms_validity_enabled: number;
  smscharlang: number;
  smscharmap: number;
  smsfulltype: number;
  url_enabled: number;
  validity: number;
}

interface UssdConfigMenuItem {
  Name: string;
  Command: string;
}

interface UssdConfigMenu {
  MenuItem: UssdConfigMenuItem[];
}

interface UssdConfigGeneral {
  Action: string;
  Description: string;
  LimitText: string;
  Menu: UssdConfigMenu;
  Title: string;
}

interface UssdConfig {
  General: UssdConfigGeneral;
}

interface DialupProfile {
  /** E.g. 1 */
  Index: number;
  IsValid: boolean;
  Name: 'PLAY' | string;
  ApnIsStatic: boolean;
  /** E.g. internet */
  ApnName: string
  /** E.g. *99# */
  DialupNum: string;
  Username: string;
  Password: string;
  /** E.g. 2 */
  AuthMode: number;
  IpIsStatic: boolean;
  IpAddress: string;
  Ipv6Address: string;
  DnsIsStatic: boolean;
  PrimaryDns: string;
  SecondaryDns: string;
  PrimaryIpv6Dns: string;
  SecondaryIpv6Dns: string;
  /** E.g. 2 */
  ReadOnly: number;
  /** E.g. 2 */
  iptype: number;
}

interface DialupProfiles {
  CurrentProfile: number;
  Profiles: DialupProfile[];
}

interface DialupConnection {
  RoamAutoConnectEnable: boolean;
  /** e.g 600 */
  MaxIdelTime: number;
  /** 0-auto, 1-manual, 2-combining on demand */
  ConnectMode: 0 | 1 | 2;
  /** e.g 1500, 1450 */
  MTU: number;
  auto_dial_switch: boolean;
  pdp_always_on: boolean;
}

interface DialupFeatureSwitch {
  iptype_enabled: boolean;
  auto_dial_enabled: boolean;
  show_dns_setting: boolean;
}

interface ConnectMode {
  Auto: boolean;
  Manual: boolean;
}

interface ConnectModeConfig {
  ConnectMode: ConnectMode;
  idle_time_enabled: number;
}

interface ConfigApiStore {
  module: ConfigModuleSwitch | null;
  encryption: {
    /** Public RSA keys */
    publicKey: PublicKey | null;
  };
  sms: SmsConfig | null;
  ussd: {
    prepaid: UssdConfig | null;
    postpaid: UssdConfig | null;
  };
  dialup: {
    connection: DialupConnection | null;
    profiles: DialupProfiles | null;
    featureSwitch: DialupFeatureSwitch | null;
    connectMode: ConnectModeConfig | null;
  };
}

// TODO: Convert to class
class Config {
  username: string | null = null;
  password: string | null = null;
  url: string | null = null;
  parsedUrl: URL | null = null;
  ussdWaitInterval: number = 1000;
  ussdTimeout: number = 20000;
  requestTimeout: number = 10000; // 10s
  api: ConfigApiStore = {
    module: null,
    encryption: {
      publicKey: null,
    },
    sms: null,
    ussd: {
      prepaid: null,
      postpaid: null,
    },
    dialup: {
      connection: null,
      profiles: null,
      featureSwitch: null,
      connectMode: null,
    },
  }

  setUrl(_url: string) {
    this.url = _url;
    this.parsedUrl = utils.parseRouterUrl(this.url);
  }

  setUsername(_username: string) {
    this.username = _username;
  }

  setPassword(_password: string) {
    this.password = _password;
  }

  getUsername() {
    return this.username;
  }

  getPassword() {
    return this.password;
  }

  getLoginDetails() {
    return {
      username: this.username,
      password: this.password,
    };
  }

  getUrl() {
    return this.url;
  }

  getParsedUrl() {
    return this.parsedUrl;
  }

  setConfig(path: string, value: any) {
    dotty.put(this.api, path, value);
  }

  /**
   * @param path The path of the config to retrieve. E.g. 'ussd.prepaid'
   * @param fresh Set to true to refresh cached values
   */
  // FIXME: Make this type-safe
  async getConfig(path: string, fresh: boolean = false): Promise<any> {
    if (!dotty.exists(this.api, path) || dotty.get(this.api, path) === null || fresh) {
      this.setConfig(path, await dotty.get(apiConfigs, path).get());
    }
    return dotty.get(this.api, path);
  }

  getModuleSwitch(): Promise<ConfigModuleSwitch> {
    return this.getConfig('module');
  }

  async getPublicEncryptionKey(): Promise<PublicKey> {
    return (await this.getConfig('enc')).publicKey;
  }

  /**
   * Get's SMS configuration
   */
  getSmsConfig(): Promise<SmsConfig> {
    return this.getConfig('sms');
  }

  /**
   * Get's USSD configuration. Includes USSD commands.
   * @param postpaid Whether to get the postpaid or prepaid config
   */
  async getUssdConfig(postpaid: boolean = false): Promise<UssdConfig> {
    const paidType = postpaid ? 'postpaid' : 'prepaid';
    return (await this.getConfig('ussd.' + paidType)).USSD;
  }
};
export default new Config();
