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
