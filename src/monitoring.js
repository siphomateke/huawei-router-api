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
