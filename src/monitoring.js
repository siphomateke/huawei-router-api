import * as ajax from './ajax';

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
