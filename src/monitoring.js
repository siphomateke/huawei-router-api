import * as ajax from '@/ajax';

/**
 * @typedef TrafficStatistics
 * @property {number} CurrentConnectTime
 * @property {number} CurrentDownload
 * @property {number} CurrentDownloadRate
 * @property {number} CurrentUpload
 * @property {number} CurrentUploadRate
 *
 * @property {number} TotalConnectTime
 * @property {number} TotalDownload
 * @property {number} TotalUpload
 * @property {number} TotalDownload
 * @property {number} showtraffic
 */

/**
 * @return {Promise<TrafficStatistics>}
 */
export function getTrafficStatistics() {
  return ajax.getAjaxData({
    url: 'api/monitoring/traffic-statistics',
    map: item => parseInt(item, 10),
  });
}

/**
 * @typedef Notifications
 * @property {number} UnreadMessage
 * @property {boolean} SmsStorageFull
 * @property {number} OnlineUpdateStatus
*/

/**
 * @return {Promise<Notifications>}
 */
export async function checkNotifications() {
  const ret = await ajax.getAjaxData({
    url: 'api/monitoring/check-notifications',
  });
  return {
    UnreadMessage: parseInt(ret.UnreadMessage, 10),
    SmsStorageFull: ret.SmsStorageFull === '1',
    OnlineUpdateStatus: parseInt(ret.OnlineUpdateStatus, 10),
  };
}

/**
 * Resets network traffic statistics
 * @return {Promise<any>}
 */
export function resetStatistics() {
  return ajax.saveAjaxData({
    url: 'api/monitoring/clear-traffic',
    request: {
      ClearTraffic: 1,
    },
    responseMustBeOk: true,
  });
}

/**
 * @typedef DataUsageSettings
 * @property {number} StartDay
 * @property {number} DataLimit
 * @property {string} DataLimitUnit
 * @property {number} DataLimitAwoke
 * @property {number} MonthThreshold
 * @property {number} SetMonthData
 * @property {number} trafficmaxlimit
 * @property {boolean} turnoffdataenable
 * @property {boolean} turnoffdataswitch
 * @property {boolean} turnoffdataflag
 */

/**
 * Get's data usage related settings. E.g. start date, data limit, threshold
 * @return {Promise<DataUsageSettings>}
 */
export async function getDataUsageSettings() {
  const data = await ajax.getAjaxData({
    url: 'api/monitoring/start_date',
  });
  const len = data.DataLimit.length;
  const dataLimit = data.DataLimit.substring(0, len-2);
  const dataLimitUnit = data.DataLimit.substring(len-2, len);
  return {
    StartDay: parseInt(data.StartDay, 10),
    DataLimit: parseInt(dataLimit, 10),
    DataLimitUnit: dataLimitUnit,
    DataLimitAwoke: parseInt(data.DataLimitAwoke, 10),
    MonthThreshold: parseInt(data.MonthThreshold, 10),
    SetMonthData: parseInt(data.SetMonthData, 10),
    trafficmaxlimit: parseInt(data.trafficmaxlimit, 10),
    turnoffdataenable: data.turnoffdataenable === '1',
    turnoffdataswitch: data.turnoffdataswitch === '1',
    turnoffdataflag: data.turnoffdataflag === '1',
  };
}

/**
 * @typedef DataUsageSettingsSet
 * @property {number} startDay
 * @property {number} dataLimit
 * @property {string} dataLimitUnit
 * @property {number} dataLimitAwoke
 * @property {number} monthThreshold
 * @property {number} setMonthData
 * @property {number} trafficMaxLimit
 * @property {boolean} turnOffDataEnable
 * @property {boolean} turnOffDataSwitch
 * @property {boolean} turnOffDataFlag
 */

/**
 * @param {DataUsageSettingsSet} options
 * @return {Promise<any>}
 */
export function setDataUsageSettings(options) {
  return ajax.saveAjaxData({
    url: 'api/monitoring/start_date',
    request: {
      StartDay: options.startDay,
      DataLimit: options.dataLimit.toString() + options.dataLimitUnit,
      DataLimitAwoke: options.dataLimitAwoke,
      MonthThreshold: options.monthThreshold,
      SetMonthData: options.setMonthData,
      trafficmaxlimit: options.trafficMaxLimit,
      turnoffdataenable: options.turnOffDataEnable ? 1 : 0,
      turnoffdataswitch: options.turnOffDataSwitch ? 1 : 0,
      turnoffdataflag: options.turnOffDataFlag ? 1 : 0,
    },
    responseMustBeOk: true,
  });
}

export const connectionStatuses = {
  COMBINING: [900],
  CONNECTED: [901],
  CONNECTION_ERROR_DENIED_NETWORK_ACCESS: [7, 11, 14, 37, 131079, 131080, 131081, 131082, 131083, 131084, 131085, 131086, 131087, 131088, 131089],
  CONNECTION_ERROR_WRONG_PROFILE: [2, 3, 5, 8, 20, 21, 23, 27, 28, 29, 30, 31, 32, 33, 65538, 65539, 65567, 65568, 131073, 131074, 131076, 131078],
  CONNECTION_ERROR: [906],
  CONNECTION_FAILED: [904],
  DATA_TRANSMISSION_LIMIT_EXCEEDED: [201],
  DISCONNECTED: [902],
  DISCONNECTION: [903],
  NO_AUTOMATIC_CONNECTION_ESTABLISHED: [112],
  NO_AUTOMATIC_ROAMING_CONNECTION_ESTABLISHED: [113],
  NO_CONNECTION_NO_ROAMING: [12, 13],
  NO_CONNECTION_WEAK_SIGNAL: [905],
  NO_RECONNECTION: [114],
  NO_ROAMING_CALL_AGAIN: [115],
};

/**
 * Compares a connection status group to a single status
 * @param {Array} compare
 * @param {number} status
 * @see connectionStatuses
 * @return {boolean}
 */
export function compareConnectionStatus(compare, status) {
  return compare.includes(status);
}

export const networkTypes = {
  0: 'no service',
  1: 'GSM',
  2: 'GPRS',
  3: 'EDGE',
  4: 'WCDMA',
  5: 'HSDPA',
  6: 'HSUPA',
  7: 'HSPA',
  8: 'TDSCDMA',
  9: 'HSPA +',
  10: 'EVDO rev. 0',
  11: 'EVDO rev. AND',
  12: 'EVDO rev. B',
  13: '1xRTT',
  14: 'UMB',
  15: '1xEVDV',
  16: '3xRTT',
  17: 'HSPA + 64QAM',
  18: 'HSPA + MIMO',
  19: 'LTE',
  21: 'IS95A',
  22: 'IS95B',
  23: 'CDMA1x',
  24: 'EVDO rev. 0',
  25: 'EVDO rev. AND',
  26: 'EVDO rev. B',
  27: 'Hybrid CDMA1x',
  28: 'Hybrid EVDO rev. 0',
  29: 'Hybrid EVDO rev. AND',
  30: 'Hybrid EVDO rev. B',
  31: 'EHRPD rev. 0',
  32: 'EHRPD rev. AND',
  33: 'EHRPD rev. B',
  34: 'Hybrid EHRPD rev. 0',
  35: 'Hybrid EHRPD rev. AND',
  36: 'Hybrid EHRPD rev. B',
  41: 'WCDMA',
  42: 'HSDPA',
  43: 'HSUPA',
  44: 'HSPA',
  45: 'HSPA +',
  46: 'DC HSPA +',
  61: 'TD SCDMA',
  62: 'TD HSDPA',
  63: 'TD HSUPA',
  64: 'TD HSPA',
  65: 'TD HSPA +',
  81: '802.16E',
  101: 'LTE',
};

/**
 * Gets the name of a network type ID
 * @param {number} value
 * @return {string}
 * @see networkTypes
 */
export function getNetworkType(value) {
  return networkTypes[value];
}

export const simStatuses = {
  NO_SIM_OR_INCORRECT: 0,
  VALID_SIM: 1,
  /** Incorrect SIM card for link switching case (CS) */
  INCORRECT_SIM_LINK_SWITCHING_CASE: 2,
  /** Incorrect SIM card for case of packet switching (PS) */
  INCORRECT_SIM_PACKET_SWITCHING_CASE: 3,
  /** Incorrect SIM card for link and packet switching (PS + CS) */
  INCORRECT_SIM_LINK_AND_PACKET_SWITCHING_CASE: 4,
  ROMSIM: 240,
  NO_SIM: 255,
};

export const batteryStatuses = {
  NORMAL: 0,
  CHARGING: 1,
  LOW: -1,
  NO_BATTERY: 2,
};

// TODO: Add more service statuses
export const serviceStatuses = {
  AVAILABLE: 2,
};

export const wifiStatuses = {
  DISABLED: '0',
  ENABLED: '1',
  INCLUDES_5G: '5G',
};

export const roamingStatuses = {
  DISABLED: 0,
  ENABLED: 1,
  NO_CHANGE: 2,
};

/**
 * @typedef Status
 * @property {number} ConnectionStatus {@link connectionStatuses}
 * @property {number} WifiConnectionStatus
 * @property {string} SignalStrength
 * @property {number} SignalIcon
 * @property {number} CurrentNetworkType {@link networkTypes}
 * @property {number} CurrentServiceDomain
 * @property {number} RoamingStatus {@link roamingStatuses}
 * @property {number} BatteryStatus {@link batteryStatuses}
 * @property {string} BatteryLevel
 * @property {string} BatteryPercent
 * @property {number} simlockStatus
 * @property {string} WanIPAddress
 * @property {string} WanIPv6Address
 * @property {string} PrimaryDns
 * @property {string} SecondaryDns
 * @property {string} PrimaryIPv6Dns
 * @property {string} SecondaryIPv6Dns
 * @property {number} CurrentWifiUser
 * @property {number} TotalWifiUser
 * @property {number} currenttotalwifiuser
 * @property {number} ServiceStatus {@link serviceStatuses}
 * @property {number} SimStatus {@link simStatuses}
 * @property {string} WifiStatus {@link wifiStatuses}
 * @property {number} CurrentNetworkTypeEx {@link networkTypes}
 * @property {number} maxsignal
 * @property {string} wifiindooronly
 * @property {string} wififrequence
 * @property {string} classify
 * @property {string} flymode
 * @property {string} cellroam
 * @property {string} voice_busy
 */

/**
* @return {Promise<Status>}
*/
export async function getStatus() {
  const data = await ajax.getAjaxData({
    url: 'api/monitoring/status',
  });
  const numbers = [
    'ConnectionStatus',
    'WifiConnectionStatus',
    'SignalIcon',
    'CurrentNetworkType',
    'CurrentServiceDomain',
    'RoamingStatus',
    'BatteryStatus',
    'simlockStatus',
    'CurrentWifiUser',
    'TotalWifiUser',
    'currenttotalwifiuser',
    'ServiceStatus',
    'SimStatus',
    'CurrentNetworkTypeEx',
    'maxsignal',
  ];
  for (const key in data) {
    if (numbers.includes(key)) {
      data[key] = parseInt(data[key], 10);
    }
  }
  return data;
}
