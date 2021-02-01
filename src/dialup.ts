import * as ajax from '@/ajax';
import config from '@/config';

// TODO: Test on a router where api/dialup/auto-apn exists
export function getAutoApn(): Promise<boolean> {
  return ajax.getAjaxData({
    url: 'api/dialup/auto-apn',
    converter: data => data.AutoAPN === '1',
  });
}

/**
 * Set the status of automatic APN selection
 */
// TODO: Test on a router where api/dialup/auto-apn exists
// TODO: Find out response type
export function setAutoApn(state: boolean): Promise<any> {
  return ajax.saveAjaxData({
    url: 'api/dialup/auto-apn',
    request: { AutoAPN: state ? 1 : 0 },
  });
}

export function getMobileDataSwitch(): Promise<boolean> {
  return ajax.getAjaxData({
    url: 'api/dialup/mobile-dataswitch',
    converter: data => data.dataswitch === '1',
  });
}

/**
 * Turns mobile data on or off
 */
export async function setMobileDataSwitch(state: boolean) {
  return ajax.saveAjaxData({
    url: 'api/dialup/mobile-dataswitch',
    request: { dataswitch: state ? 1 : 0 },
    responseMustBeOk: true,
  });
}

export function getConnection(fresh: boolean = false) {
  return config.getConfig('dialup.connection', fresh);
}

interface ConnectionOptions {
  roamAutoConnectEnable: boolean;
  maxIdleTime: number;
  connectMode: number;
  mtu: number;
  autoDialSwitch: boolean;
  pdpAlwaysOn: boolean;
}

/**
 * Set settings for automatic connection establishment
 */
// TODO: test setting connection config
// `auto_dial_switch` and `pdp_always_on` may not be needed
export function setConnection(options: ConnectionOptions) {
  return ajax.saveAjaxData({
    url: 'api/dialup/connection',
    request: {
      RoamAutoConnectEnable: options.roamAutoConnectEnable,
      MaxIdelTime: options.maxIdleTime,
      ConnectMode: options.connectMode,
      MTU: options.mtu,
      auto_dial_switch: options.autoDialSwitch,
      pdp_always_on: options.pdpAlwaysOn,
    },
    responseMustBeOk: true,
  });
}

export function getProfiles(fresh: boolean = false) {
  return config.getConfig('dialup.profiles', fresh);
}

interface ProfileApn {
  isStatic: boolean;
  name: string;
}

interface Profile {
  idx?: number;
  /** 1 */
  isValid: boolean;
  /** PLAY */
  name: string
  apn: ProfileApn;
  /** *99# */
  dialupNum: string;
  username: string;
  password: string;
  /** 2 */
  authMode: number;
  /** 0 */
  dnsIsStatic: boolean;
  primaryDns: string;
  secondaryDns: string;
  /** 2 */
  readOnly: number;
  /** 2 */
  ipType: number;
}

export enum ProfileModifyType {
  DELETE = 0,
  ADD = 1,
  CHANGE = 2,
}

/**
 * Generic function to help with modifying profiles
 * @param deleteIdx What index to delete
 * @param defaultIndex Index to set as the default
 * @param modify The type of change
 */
function saveProfile(deleteIdx: number, defaultIndex: number, modify: ProfileModifyType, profile: Profile | null = null) {
  const request = {
    Delete: deleteIdx,
    SetDefault: defaultIndex,
    Modify: modify,
  };
  if (profile) {
    request.Profile = {
      Index: profile.idx,
      IsValid: profile.isValid ? 1 : 0,
      Name: profile.name,
      ApnIsStatic: profile.apn.isStatic ? 1 : 0,
      ApnName: profile.apn.name,
      DialupNum: profile.dialupNum,
      Username: profile.username,
      Password: profile.password,
      AuthMode: profile.authMode,
      DnsIsStatic: profile.dnsIsStatic,
      PrimaryDns: profile.primaryDns,
      SecondaryDns: profile.secondaryDns,
      ReadOnly: 0,
      iptype: profile.ipType,
    };
  }
  return ajax.saveAjaxData({
    url: 'api/dialup/profiles',
    request,
    responseMustBeOk: true,
  });
}

/**
 * Deletes the profile with the specified index
 * @param idx Index to delete
 * @param defaultIndex Index to set as the default
 */
export function deleteProfile(idx: number, defaultIndex: number) {
  return saveProfile(idx, defaultIndex, 0);
}

/**
 * Adds a new profile
 * @param defaultIndex Index to set as the default
 * @param profile
 */
export function addProfile(defaultIndex: number, profile: Profile) {
  profile.idx = '';
  profile.isValid = 1;
  return saveProfile(0, defaultIndex, 1, profile);
}

/**
 * Modifies the profile with the specified index
 */
export function editProfile(profile: Profile) {
  return saveProfile(0, profile.idx, 2, profile);
}

enum DialupActionType {
  DISCONNECT = 0,
  NEW_CONNECTION = 1,
}

/**
 * Establishing and disconnecting a connection
 * @param action
 * @return {Promise<any>}
 */
export function dial(action: DialupActionType) {
  return ajax.saveAjaxData({
    url: 'api/dialup/dial',
    request: {
      Action: action,
    },
    responseMustBeOk: true,
  });
}

/**
 * Downloading the switch settings for the dialup module
 */
export function getFeatureSwitch(fresh: boolean = false) {
  return config.getConfig('dialup.featureSwitch', fresh);
}

export function getConnectMode(fresh: boolean = false) {
  return config.getConfig('dialup.connectMode', fresh);
}
