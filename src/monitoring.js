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
 * @property {number} unreadmessage
 * @property {boolean} smsstoragefull
 * @property {number} onlineupdatestatus
*/

/**
 * @return {Promise<Notifications>}
 */
export async function checkNotifications() {
  const ret = await ajax.getAjaxData({
    url: 'api/monitoring/check-notifications',
  });
  return {
    unreadmessage: ret.unreadmessage,
    smsstoragefull: ret.smsstoragefull === '1',
    onlineupdatestatus: ret.onlineupdatestatus,
  };
}
