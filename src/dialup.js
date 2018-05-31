import * as ajax from '@/ajax';
import config from '@/config';

/**
 *
 * @return {Promise<boolean>}
 */
// TODO: Test on a router where api/dialup/auto-apn exists
export function getAutoApn() {
  return ajax.getAjaxData({
    url: 'api/dialup/auto-apn',
    converter: data => data.AutoAPN === '1',
  });
}

/**
 * Set the status of automatic APN selection
 * @param {boolean} state
 * @return {Promise<any>}
 */
// TODO: Test on a router where api/dialup/auto-apn exists
export function setAutoApn(state) {
  return ajax.saveAjaxData({
    url: 'api/dialup/auto-apn',
    request: {AutoAPN: state ? 1 : 0},
  });
}

/**
 *
 * @return {Promise<boolean>}
 */
export function getMobileDataSwitch() {
  return ajax.getAjaxData({
    url: 'api/dialup/mobile-dataswitch',
    converter: data => data.dataswitch === '1',
  });
}

/**
 * Turns mobile data on or off
 * @param {boolean} state
 * @return {Promise<any>}
 */
export async function setMobileDataSwitch(state) {
  return ajax.saveAjaxData({
    url: 'api/dialup/mobile-dataswitch',
    request: {dataswitch: state ? 1 : 0},
    responseMustBeOk: true,
  });
}

/**
 * @param {boolean} [fresh=false]
 * @return {Promise<any>}
 */
export function getConnection(fresh=false) {
  return config.getConfig('dialup.connection', fresh);
}

/**
 * @typedef ConnectionOptions
 * @property {boolean} roamAutoConnectEnable
 * @property {number} maxIdleTime
 * @property {number} connectMode
 * @property {number} mtu
 * @property {boolean} autoDialSwitch
 * @property {boolean} pdpAlwaysOn
 */

/**
 * Set settings for automatic connection establishment
 * @param {ConnectionOptions} options
 * @return {Promise<any>}
 */
// TODO: test setting connection config
// `auto_dial_switch` and `pdp_always_on` may not be needed
export function setConnection(options) {
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

export function getProfiles(fresh=false) {
  return config.getConfig('dialup.profiles', fresh);
}

/**
 * @typedef ProfileApn
 * @property {boolean} isStatic
 * @property {string} name
 */

/**
 * @typedef Profile
 * @property {number} [idx]
 * @property {boolean} isValid 1
 * @property {string} name PLAY
 * @property {ProfileApn} apn
 * @property {string} dialupNum *99#
 * @property {string} username
 * @property {string} password
 * @property {number} authMode 2
 * @property {boolean} dnsIsStatic 0
 * @property {string} primaryDns
 * @property {string} secondaryDns
 * @property {number} readOnly 2
 * @property {number} ipType 2
 */

/**
 * Generic function to help with modifying profiles
 * @param {number} deleteIdx What index to delete
 * @param {number} defaultIndex Index to set as the default
 * @param {0|1|2} modify The type of change; 0-delete, 1-add, 2-change
 * @param {Profile} [profile=null]
 * @return {Promise<any>}
 */
function saveProfile(deleteIdx, defaultIndex, modify, profile=null) {
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
 * @param {number} idx Index to delete
 * @param {number} defaultIndex Index to set as the default
 * @return {Promise<any>}
 */
export function deleteProfile(idx, defaultIndex) {
  return saveProfile(idx, defaultIndex, 0);
}

/**
 * Adds a new profile
 * @param {number} defaultIndex Index to set as the default
 * @param {Profile} profile
 * @return {Promise<any>}
 */
export function addProfile(defaultIndex, profile) {
  profile.idx = '';
  profile.isValid = 1;
  return saveProfile(0, defaultIndex, 1, profile);
}

/**
 * Modifies the profile with the specified index
 * @param {Profile} profile
 * @return {Promise<any>}
 */
export function editProfile(profile) {
  return saveProfile(0, profile.idx, 2, profile);
}

/**
 * Establishing and disconnecting a connection
 * @param {0|1} action 0-Disconnect, 1-Establish a connection
 * @return {Promise<any>}
 */
export function dial(action) {
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
 * @param {boolean} [fresh=false]
 * @return {Promise<any>}
 */
export function getFeatureSwitch(fresh=false) {
  return config.getConfig('dialup.featureSwitch', fresh);
}
