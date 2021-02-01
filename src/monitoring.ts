import * as ajax from '@/ajax';

interface TrafficStatistics {
  CurrentConnectTime: number;
  CurrentDownload: number;
  CurrentDownloadRate: number;
  CurrentUpload: number;
  CurrentUploadRate: number;

  TotalConnectTime: number;
  TotalDownload: number;
  TotalUpload: number;
  showtraffic: number;
}

export function getTrafficStatistics(): Promise<TrafficStatistics> {
  return ajax.getAjaxData({
    url: 'api/monitoring/traffic-statistics',
    map: item => parseInt(item, 10),
  });
}

interface RouterNotifications {
  UnreadMessage: number;
  SmsStorageFull: boolean;
  OnlineUpdateStatus: number;
}

export async function checkNotifications(): Promise<RouterNotifications> {
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

interface DataUsageSettings {
  StartDay: number;
  DataLimit: number;
  DataLimitUnit: string;
  DataLimitAwoke: number;
  MonthThreshold: number;
  SetMonthData: number;
  trafficmaxlimit: number;
  turnoffdataenable: boolean;
  turnoffdataswitch: boolean;
  turnoffdataflag: boolean;
}

/**
 * Get's data usage related settings. E.g. start date, data limit, threshold
 */
export async function getDataUsageSettings(): Promise<DataUsageSettings> {
  const data = await ajax.getAjaxData({
    url: 'api/monitoring/start_date',
  });
  const len = data.DataLimit.length;
  const dataLimit = data.DataLimit.substring(0, len - 2);
  const dataLimitUnit = data.DataLimit.substring(len - 2, len);
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

interface SetDataUsageSettingsFnOptions {
  startDay: number;
  dataLimit: number;
  dataLimitUnit: string;
  dataLimitAwoke: number;
  monthThreshold: number;
  setMonthData: number;
  trafficMaxLimit: number;
  turnOffDataEnable: boolean;
  turnOffDataSwitch: boolean;
  turnOffDataFlag: boolean;
}

export function setDataUsageSettings(options: SetDataUsageSettingsFnOptions) {
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

export enum ConnectionStatusGroup {
  COMBINING,
  CONNECTED,
  CONNECTION_ERROR_DENIED_NETWORK_ACCESS,
  CONNECTION_ERROR_WRONG_PROFILE,
  CONNECTION_ERROR,
  CONNECTION_FAILED,
  DATA_TRANSMISSION_LIMIT_EXCEEDED,
  DISCONNECTED,
  DISCONNECTION,
  NO_AUTOMATIC_CONNECTION_ESTABLISHED,
  NO_AUTOMATIC_ROAMING_CONNECTION_ESTABLISHED,
  NO_CONNECTION_NO_ROAMING,
  NO_CONNECTION_WEAK_SIGNAL,
  NO_RECONNECTION,
  NO_ROAMING_CALL_AGAIN,
}

const s = ConnectionStatusGroup;

export const connectionStatuses: { [key in ConnectionStatusGroup]: number[]} = {
  [s.COMBINING]: [900],
  [s.CONNECTED]: [901],
  [s.CONNECTION_ERROR_DENIED_NETWORK_ACCESS]: [7, 11, 14, 37, 131079, 131080, 131081, 131082, 131083, 131084, 131085, 131086, 131087, 131088, 131089],
  [s.CONNECTION_ERROR_WRONG_PROFILE]: [2, 3, 5, 8, 20, 21, 23, 27, 28, 29, 30, 31, 32, 33, 65538, 65539, 65567, 65568, 131073, 131074, 131076, 131078],
  [s.CONNECTION_ERROR]: [906],
  [s.CONNECTION_FAILED]: [904],
  [s.DATA_TRANSMISSION_LIMIT_EXCEEDED]: [201],
  [s.DISCONNECTED]: [902],
  [s.DISCONNECTION]: [903],
  [s.NO_AUTOMATIC_CONNECTION_ESTABLISHED]: [112],
  [s.NO_AUTOMATIC_ROAMING_CONNECTION_ESTABLISHED]: [113],
  [s.NO_CONNECTION_NO_ROAMING]: [12, 13],
  [s.NO_CONNECTION_WEAK_SIGNAL]: [905],
  [s.NO_RECONNECTION]: [114],
  [s.NO_ROAMING_CALL_AGAIN]: [115],
};

/**
 * Compares a connection status group to a single status
 * @see connectionStatuses
 */
export function compareConnectionStatus(compare: number[], status: number): boolean {
  return compare.includes(status);
}

export enum NetworkType {
  NO_SERVICE,
  GSM,
  GPRS,
  EDGE,
  WCDMA,
  HSDPA,
  HSUPA,
  HSPA,
  TDSCDMA,
  HSPA_PLUS,
  EVDO_REV_0,
  EVDO_REV_AND,
  EVDO_REV_B,
  '1X_RTT',
  UMB,
  '1X_EVDV',
  '3X_RTT',
  HSPA_PLUS_64QAM,
  HSPA_PLUS_MIMO,
  LTE,
  IS95A,
  IS95B,
  CDMA_1X,
  HYBRID_CDMA_1X,
  HYBRID_EVDO_REV_0,
  HYBRID_EVDO_REV_AND,
  HYBRID_EVDO_REV_B,
  EHRPD_REV_0,
  EHRPD_REV_AND,
  EHRPD_REV_B,
  HYBRID_EHRPD_REV_0,
  HYBRID_EHRPD_REV_and,
  HYBRID_EHRPD_REV_B,
  DC_HSPA_PLUS,
  TD_SCDMA,
  TD_HSDPA,
  TD_HSUPA,
  TD_HSPA,
  TD_HSPA_PLUS,
  '802.16E',
}

export const networkTypes: { [code: number]: NetworkType } = {
  0: NetworkType.NO_SERVICE,
  1: NetworkType.GSM,
  2: NetworkType.GPRS,
  3: NetworkType.EDGE,
  4: NetworkType.WCDMA,
  5: NetworkType.HSDPA,
  6: NetworkType.HSUPA,
  7: NetworkType.HSPA,
  8: NetworkType.TDSCDMA,
  9: NetworkType.HSPA_PLUS,
  10: NetworkType.EVDO_REV_0,
  11: NetworkType.EVDO_REV_AND,
  12: NetworkType.EVDO_REV_B,
  13: NetworkType['1X_RTT'],
  14: NetworkType.UMB,
  15: NetworkType['1X_EVDV'],
  16: NetworkType['3X_RTT'],
  17: NetworkType.HSPA_PLUS_64QAM,
  18: NetworkType.HSPA_PLUS_MIMO,
  19: NetworkType.LTE,
  21: NetworkType.IS95A,
  22: NetworkType.IS95B,
  23: NetworkType.CDMA_1X,
  24: NetworkType.EVDO_REV_0,
  25: NetworkType.EVDO_REV_AND,
  26: NetworkType.EVDO_REV_B,
  27: NetworkType.HYBRID_CDMA_1X,
  28: NetworkType.HYBRID_EVDO_REV_0,
  29: NetworkType.HYBRID_EVDO_REV_AND,
  30: NetworkType.HYBRID_EVDO_REV_B,
  31: NetworkType.EHRPD_REV_0,
  32: NetworkType.EHRPD_REV_AND,
  33: NetworkType.EHRPD_REV_B,
  34: NetworkType.HYBRID_EHRPD_REV_0,
  35: NetworkType.HYBRID_EHRPD_REV_and,
  36: NetworkType.HYBRID_EHRPD_REV_B,
  41: NetworkType.WCDMA,
  42: NetworkType.HSDPA,
  43: NetworkType.HSUPA,
  44: NetworkType.HSPA,
  45: NetworkType.HSPA_PLUS,
  46: NetworkType.DC_HSPA_PLUS,
  61: NetworkType.TD_SCDMA,
  62: NetworkType.TD_HSDPA,
  63: NetworkType.TD_HSUPA,
  64: NetworkType.TD_HSPA,
  65: NetworkType.TD_HSPA_PLUS,
  81: NetworkType['802.16E'],
  101: NetworkType.LTE,
};

/**
 * Gets the name of a network type ID
 */
export function getNetworkType(value: number): NetworkType {
  return networkTypes[value];
}

export enum SimStatus {
  NO_SIM_OR_INCORRECT = 0,
  VALID_SIM = 1,
  /** Incorrect SIM card for link switching case (CS) */
  INCORRECT_SIM_LINK_SWITCHING_CASE = 2,
  /** Incorrect SIM card for case of packet switching (PS) */
  INCORRECT_SIM_PACKET_SWITCHING_CASE = 3,
  /** Incorrect SIM card for link and packet switching (PS + CS) */
  INCORRECT_SIM_LINK_AND_PACKET_SWITCHING_CASE = 4,
  ROMSIM = 240,
  NO_SIM = 255,
};

export enum BatteryStatus {
  NORMAL = 0,
  CHARGING = 1,
  LOW = -1,
  NO_BATTERY = 2,
};

// TODO: Add more service statuses
export enum ServiceStatus {
  AVAILABLE = 2
};

export enum WifiStatus {
  DISABLED = '0',
  ENABLED = '1',
  INCLUDES_5G = '5G',
};

export enum RoamingStatus {
  DISABLED = 0,
  ENABLED = 1,
  NO_CHANGE = 2,
};

interface Status {
  /** @see connectionStatuses */
  ConnectionStatus: number;
  WifiConnectionStatus: number;
  SignalStrength: string;
  SignalIcon: number;
  CurrentNetworkType: NetworkType;
  CurrentServiceDomain: number;
  RoamingStatus: RoamingStatus;
  BatteryStatus: BatteryStatus;
  BatteryLevel: string;
  BatteryPercent: string;
  simlockStatus: number;
  WanIPAddress: string;
  WanIPv6Address: string;
  PrimaryDns: string;
  SecondaryDns: string;
  PrimaryIPv6Dns: string;
  SecondaryIPv6Dns: string;
  CurrentWifiUser: number;
  TotalWifiUser: number;
  currenttotalwifiuser: number;
  ServiceStatus: ServiceStatus;
  SimStatus: SimStatus;
  WifiStatus: WifiStatus;
  CurrentNetworkTypeEx: NetworkType;
  maxsignal: number;
  wifiindooronly: string;
  wififrequence: string;
  classify: string;
  flymode: string;
  cellroam: string;
  voice_busy: string;
}

export async function getStatus(): Promise<Status> {
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
  for (const key of Object.keys(data)) {
    if (numbers.includes(key)) {
      data[key] = parseInt(data[key], 10);
    }
  }
  return data;
}
