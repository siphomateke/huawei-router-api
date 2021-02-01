'use strict';
import ExtendableError from 'es6-error';

export type RequestErrorCode = 'timeout' | 'invalid_status' | 'no_response' | 'error' | 'invalid_xml';
// FIXME: Add error codes
export type UssdErrorCodes = 'ussd_release_fail'
export type SmsErrorCodes = 'sms_import_disabled' | 'sms_import_sim_empty' | 'sms_not_enough_space';
// FIXME: Figure out how to append strings to the union types.
export type RouterErrorCodes =
  RequestErrorCode
  | RouterApiErrorCode
  | UssdErrorCodes
  | SmsErrorCodes;

export class RouterError extends ExtendableError {
  // TODO: Add all possible error codes
  constructor(public code: string, message?: string) {
    super(typeof message !== 'undefined' ? message : code);
  }
  toString() {
    return `${this.code}: ${this.message}`;
  }
}

export class RouterApiError extends RouterError {
  constructor(code: RouterApiErrorCode, message: string) {
    super('api_' + code, message);
  }
}

export class RequestError extends RouterError {
  constructor(code: RequestErrorCode, message: string) {
    super('http_request_' + code, message);
  }
}

export enum RouterApiErrorCode {
  DEFAULT = 'default',
  NO_DEVICE = 'no_device',
  FIRST_SEND = 'first_send',
  UNKNOWN = 'unknown',
  SYSTEM_NO_SUPPORT = 'system_no_support',
  SYSTEM_NO_RIGHTS = 'system_no_rights',
  SYSTEM_BUSY = 'system_busy',
  FORMAT_ERROR = 'format_error',
  PARAMETER_ERROR = 'parameter_error',
  SAVE_CONFIG_FILE_ERROR = 'save_config_file_error',
  GET_CONFIG_FILE_ERROR = 'get_config_file_error',
  NO_SIM_CARD_OR_INVALID_SIM_CARD = 'no_sim_card_or_invalid_sim_card',
  CHECK_SIM_CARD_PIN_LOCK = 'check_sim_card_pin_lock',
  CHECK_SIM_CARD_PUN_LOCK = 'check_sim_card_pun_lock',
  CHECK_SIM_CARD_CAN_UNUSABLE = 'check_sim_card_can_unusable',
  ENABLE_PIN_FAILED = 'enable_pin_failed',
  DISABLE_PIN_FAILED = 'disable_pin_failed',
  UNLOCK_PIN_FAILED = 'unlock_pin_failed',
  DISABLE_AUTO_PIN_FAILED = 'disable_auto_pin_failed',
  ENABLE_AUTO_PIN_FAILED = 'enable_auto_pin_failed',
  GET_NET_TYPE_FAILED = 'get_net_type_failed',
  GET_SERVICE_STATUS_FAILED = 'get_service_status_failed',
  GET_ROAM_STATUS_FAILED = 'get_roam_status_failed',
  GET_CONNECT_STATUS_FAILED = 'get_connect_status_failed',
  DEVICE_AT_EXECUTE_FAILED = 'device_at_execute_failed',
  DEVICE_PIN_VALIDATE_FAILED = 'device_pin_validate_failed',
  DEVICE_PIN_MODIFY_FAILED = 'device_pin_modify_failed',
  DEVICE_PUK_MODIFY_FAILED = 'device_puk_modify_failed',
  DEVICE_GET_AUTORUN_VERSION_FAILED = 'device_get_autorun_version_failed',
  DEVICE_GET_API_VERSION_FAILED = 'device_get_api_version_failed',
  DEVICE_GET_PRODUCT_INFORMATION_FAILED = 'device_get_product_information_failed',
  DEVICE_SIM_CARD_BUSY = 'device_sim_card_busy',
  DEVICE_SIM_LOCK_INPUT_ERROR = 'device_sim_lock_input_error',
  DEVICE_NOT_SUPPORT_REMOTE_OPERATE = 'device_not_support_remote_operate',
  DEVICE_PUK_DEAD_LOCK = 'device_puk_dead_lock',
  DEVICE_GET_PC_ASSIST_INFORMATION_FAILED = 'device_get_pc_assist_information_failed',
  DEVICE_SET_LOG_INFORMATION_LEVEL_FAILED = 'device_set_log_information_level_failed',
  DEVICE_GET_LOG_INFORMATION_LEVEL_FAILED = 'device_get_log_information_level_failed',
  DEVICE_COMPRESS_LOG_FILE_FAILED = 'device_compress_log_file_failed',
  DEVICE_RESTORE_FILE_DECRYPT_FAILED = 'device_restore_file_decrypt_failed',
  DEVICE_RESTORE_FILE_VERSION_MATCH_FAILED = 'device_restore_file_version_match_failed',
  DEVICE_RESTORE_FILE_FAILED = 'device_restore_file_failed',
  DEVICE_SET_TIME_FAILED = 'device_set_time_failed',
  COMPRESS_LOG_FILE_FAILED = 'compress_log_file_failed',
  DHCP_ERROR = 'dhcp_error',
  SAFE_ERROR = 'safe_error',
  DIALUP_GET_CONNECT_FILE_ERROR = 'dialup_get_connect_file_error',
  DIALUP_SET_CONNECT_FILE_ERROR = 'dialup_set_connect_file_error',
  DIALUP_DIALUP_MANAGEMENT_PARSE_ERROR = 'dialup_dialup_management_parse_error',
  DIALUP_ADD_PROFILE_ERROR = 'dialup_add_profile_error',
  DIALUP_MODIFY_PROFILE_ERROR = 'dialup_modify_profile_error',
  DIALUP_SET_DEFAULT_PROFILE_ERROR = 'dialup_set_default_profile_error',
  DIALUP_GET_PROFILE_LIST_ERROR = 'dialup_get_profile_list_error',
  DIALUP_GET_AUTO_APN_MATCH_ERROR = 'dialup_get_auto_apn_match_error',
  DIALUP_SET_AUTO_APN_MATCH_ERROR = 'dialup_set_auto_apn_match_error',
  LOGIN_USERNAME_WRONG = 'login_username_wrong',
  LOGIN_PASSWORD_WRONG = 'login_password_wrong',
  LOGIN_ALREADY_LOGIN = 'login_already_login',
  LOGIN_MODIFY_PASSWORD_FAILED = 'login_modify_password_failed',
  LOGIN_TOO_MANY_USERS_LOGGED_IN = 'login_too_many_users_logged_in',
  LOGIN_USERNAME_PWD_WRONG = 'login_username_pwd_wrong',
  LOGIN_USERNAME_PWD_ORERRUN = 'login_username_pwd_orerrun',
  LANGUAGE_GET_FAILED = 'language_get_failed',
  LANGUAGE_SET_FAILED = 'language_set_failed',
  ONLINE_UPDATE_SERVER_NOT_ACCESSED = 'online_update_server_not_accessed',
  ONLINE_UPDATE_ALREADY_BOOTED = 'online_update_already_booted',
  ONLINE_UPDATE_GET_DEVICE_INFORMATION_FAILED = 'online_update_get_device_information_failed',
  ONLINE_UPDATE_GET_LOCAL_GROUP_COMPONENT_INFORMATION_FAILED = 'online_update_get_local_group_component_information_failed',
  ONLINE_UPDATE_NOT_FIND_FILE_ON_SERVER = 'online_update_not_find_file_on_server',
  ONLINE_UPDATE_NEED_RECONNECT_SERVER = 'online_update_need_reconnect_server',
  ONLINE_UPDATE_CANCEL_DOWNLOADING = 'online_update_cancel_downloading',
  ONLINE_UPDATE_SAME_FILE_LIST = 'online_update_same_file_list',
  ONLINE_UPDATE_CONNECT_ERROR = 'online_update_connect_error',
  ONLINE_UPDATE_INVALID_URL_LIST = 'online_update_invalid_url_list',
  ONLINE_UPDATE_NOT_SUPPORT_URL_LIST = 'online_update_not_support_url_list',
  ONLINE_UPDATE_NOT_BOOT = 'online_update_not_boot',
  ONLINE_UPDATE_LOW_BATTERY = 'online_update_low_battery',
  USSD_NET_NO_RETURN = 'ussd_net_no_return',
  USSD_ERROR = 'ussd_error',
  USSD_FUNCTION_RETURN_ERROR = 'ussd_function_return_error',
  USSD_IN_USSD_SESSION = 'ussd_in_ussd_session',
  USSD_TOO_LONG_CONTENT = 'ussd_too_long_content',
  USSD_EMPTY_COMMAND = 'ussd_empty_command',
  USSD_CODING_ERROR = 'ussd_coding_error',
  USSD_AT_SEND_FAILED = 'ussd_at_send_failed',
  USSD_PROCESSING = 'ussd_processing',
  USSD_TIMEOUT = 'ussd_timeout',
  USSD_XML_SPECIAL_CHARACTER_TRANSFER_FAILED = 'ussd_xml_special_character_transfer_failed',
  USSD_NET_NOT_SUPPORT_USSD = 'ussd_net_not_support_ussd',
  SET_NET_MODE_AND_BAND_WHEN_DIALUP_FAILED = 'set_net_mode_and_band_when_dialup_failed',
  SET_NET_SEARCH_MODE_WHEN_DIALUP_FAILED = 'set_net_search_mode_when_dialup_failed',
  SET_NET_MODE_AND_BAND_FAILED = 'set_net_mode_and_band_failed',
  SET_NET_SEARCH_MODE_FAILED = 'set_net_search_mode_failed',
  NET_REGISTER_NET_FAILED = 'net_register_net_failed',
  NET_NET_CONNECTED_ORDER_NOT_MATCH = 'net_net_connected_order_not_match',
  NET_CURRENT_NET_MODE_NOT_SUPPORT = 'net_current_net_mode_not_support',
  NET_SIM_CARD_NOT_READY_STATUS = 'net_sim_card_not_ready_status',
  NET_MEMORY_ALLOC_FAILED = 'net_memory_alloc_failed',
  SMS_NULL_ARGUMENT_OR_ILLEGAL_ARGUMENT = 'sms_null_argument_or_illegal_argument',
  SMS_SYSTEM_BUSY = 'sms_system_busy',
  SMS_QUERY_SMS_INDEX_LIST_ERROR = 'sms_query_sms_index_list_error',
  SMS_SET_SMS_CENTER_NUMBER_FAILED = 'sms_set_sms_center_number_failed',
  SMS_DELETE_SMS_FAILED = 'sms_delete_sms_failed',
  SMS_SAVE_CONFIG_FILE_FAILED = 'sms_save_config_file_failed',
  SMS_NOT_ENOUGH_SPACE = 'sms_not_enough_space',
  SMS_TELEPHONE_NUMBER_TOO_LONG = 'sms_telephone_number_too_long',
  SD_FILE_EXIST = 'sd_file_exist',
  SD_DIRECTORY_EXIST = 'sd_directory_exist',
  SD_FILE_OR_DIRECTORY_NOT_EXIST = 'sd_file_or_directory_not_exist',
  SD_FILE_NAME_TOO_LONG = 'sd_file_name_too_long',
  SD_NO_RIGHT = 'sd_no_right',
  SD_FILE_IS_UPLOADING = 'sd_file_is_uploading',
  PB_NULL_ARGUMENT_OR_ILLEGAL_ARGUMENT = 'pb_null_argument_or_illegal_argument',
  PB_OVERTIME = 'pb_overtime',
  PB_CALL_SYSTEM_FUNCTION_ERROR = 'pb_call_system_function_error',
  PB_WRITE_FILE_ERROR = 'pb_write_file_error',
  PB_READ_FILE_ERROR = 'pb_read_file_error',
  PB_LOCAL_TELEPHONE_FULL_ERROR = 'pb_local_telephone_full_error',
  STK_NULL_ARGUMENT_OR_ILLEGAL_ARGUMENT = 'stk_null_argument_or_illegal_argument',
  STK_OVERTIME = 'stk_overtime',
  STK_CALL_SYSTEM_FUNCTION_ERROR = 'stk_call_system_function_error',
  STK_WRITE_FILE_ERROR = 'stk_write_file_error',
  STK_READ_FILE_ERROR = 'stk_read_file_error',
  WIFI_STATION_CONNECT_AP_PASSWORD_ERROR = 'wifi_station_connect_ap_password_error',
  WIFI_WEB_PASSWORD_OR_DHCP_OVERTIME_ERROR = 'wifi_web_password_or_dhcp_overtime_error',
  WIFI_PBC_CONNECT_FAILED = 'wifi_pbc_connect_failed',
  WIFI_STATION_CONNECT_AP_WISPR_PASSWORD_ERROR = 'wifi_station_connect_ap_wispr_password_error',
  CRADLE_GET_CURRENT_CONNECTED_USER_IP_FAILED = 'cradle_get_current_connected_user_ip_failed',
  CRADLE_GET_CURRENT_CONNECTED_USER_MAC_FAILED = 'cradle_get_current_connected_user_mac_failed',
  CRADLE_SET_MAC_FAILED = 'cradle_set_mac_failed',
  CRADLE_GET_WAN_INFORMATION_FAILED = 'cradle_get_wan_information_failed',
  CRADLE_CODING_FAILED = 'cradle_coding_failed',
  CRADLE_UPDATE_PROFILE_FAILED = 'cradle_update_profile_failed',
  VOICE_BUSY = 'voice_busy',
  WRONG_TOKEN = 'wrong_token',
  WRONG_SESSION = 'wrong_session',
  WRONG_SESSION_TOKEN = 'wrong_session_token',
}

const c = RouterApiErrorCode;
export const apiErrorCodes: {[numericErrorCode: string]: RouterApiErrorCode} = {
  '-1': c.DEFAULT,
  '-2': c.NO_DEVICE,
  '1': c.FIRST_SEND,
  '100001': c.UNKNOWN,
  '100002': c.SYSTEM_NO_SUPPORT,
  '100003': c.SYSTEM_NO_RIGHTS,
  '100004': c.SYSTEM_BUSY,
  '100005': c.FORMAT_ERROR,
  '100006': c.PARAMETER_ERROR,
  '100007': c.SAVE_CONFIG_FILE_ERROR,
  '100008': c.GET_CONFIG_FILE_ERROR,
  '101001': c.NO_SIM_CARD_OR_INVALID_SIM_CARD,
  '101002': c.CHECK_SIM_CARD_PIN_LOCK,
  '101003': c.CHECK_SIM_CARD_PUN_LOCK,
  '101004': c.CHECK_SIM_CARD_CAN_UNUSABLE,
  '101005': c.ENABLE_PIN_FAILED,
  '101006': c.DISABLE_PIN_FAILED,
  '101007': c.UNLOCK_PIN_FAILED,
  '101008': c.DISABLE_AUTO_PIN_FAILED,
  '101009': c.ENABLE_AUTO_PIN_FAILED,
  '102001': c.GET_NET_TYPE_FAILED,
  '102002': c.GET_SERVICE_STATUS_FAILED,
  '102003': c.GET_ROAM_STATUS_FAILED,
  '102004': c.GET_CONNECT_STATUS_FAILED,
  '103001': c.DEVICE_AT_EXECUTE_FAILED,
  '103002': c.DEVICE_PIN_VALIDATE_FAILED,
  '103003': c.DEVICE_PIN_MODIFY_FAILED,
  '103004': c.DEVICE_PUK_MODIFY_FAILED,
  '103005': c.DEVICE_GET_AUTORUN_VERSION_FAILED,
  '103006': c.DEVICE_GET_API_VERSION_FAILED,
  '103007': c.DEVICE_GET_PRODUCT_INFORMATION_FAILED,
  '103008': c.DEVICE_SIM_CARD_BUSY,
  '103009': c.DEVICE_SIM_LOCK_INPUT_ERROR,
  '103010': c.DEVICE_NOT_SUPPORT_REMOTE_OPERATE,
  '103011': c.DEVICE_PUK_DEAD_LOCK,
  '103012': c.DEVICE_GET_PC_ASSIST_INFORMATION_FAILED,
  '103013': c.DEVICE_SET_LOG_INFORMATION_LEVEL_FAILED,
  '103014': c.DEVICE_GET_LOG_INFORMATION_LEVEL_FAILED,
  '103015': c.DEVICE_COMPRESS_LOG_FILE_FAILED,
  '103016': c.DEVICE_RESTORE_FILE_DECRYPT_FAILED,
  '103017': c.DEVICE_RESTORE_FILE_VERSION_MATCH_FAILED,
  '103018': c.DEVICE_RESTORE_FILE_FAILED,
  '103101': c.DEVICE_SET_TIME_FAILED,
  '103102': c.COMPRESS_LOG_FILE_FAILED,
  '104001': c.DHCP_ERROR,
  '106001': c.SAFE_ERROR,
  '107720': c.DIALUP_GET_CONNECT_FILE_ERROR,
  '107721': c.DIALUP_SET_CONNECT_FILE_ERROR,
  '107722': c.DIALUP_DIALUP_MANAGEMENT_PARSE_ERROR,
  '107724': c.DIALUP_ADD_PROFILE_ERROR,
  '107725': c.DIALUP_MODIFY_PROFILE_ERROR,
  '107726': c.DIALUP_SET_DEFAULT_PROFILE_ERROR,
  '107727': c.DIALUP_GET_PROFILE_LIST_ERROR,
  '107728': c.DIALUP_GET_AUTO_APN_MATCH_ERROR,
  '107729': c.DIALUP_SET_AUTO_APN_MATCH_ERROR,
  '108001': c.LOGIN_USERNAME_WRONG,
  '108002': c.LOGIN_PASSWORD_WRONG,
  '108003': c.LOGIN_ALREADY_LOGIN,
  '108004': c.LOGIN_MODIFY_PASSWORD_FAILED,
  '108005': c.LOGIN_TOO_MANY_USERS_LOGGED_IN,
  '108006': c.LOGIN_USERNAME_PWD_WRONG,
  '108007': c.LOGIN_USERNAME_PWD_ORERRUN,
  '109001': c.LANGUAGE_GET_FAILED,
  '109002': c.LANGUAGE_SET_FAILED,
  '110001': c.ONLINE_UPDATE_SERVER_NOT_ACCESSED,
  '110002': c.ONLINE_UPDATE_ALREADY_BOOTED,
  '110003': c.ONLINE_UPDATE_GET_DEVICE_INFORMATION_FAILED,
  '110004': c.ONLINE_UPDATE_GET_LOCAL_GROUP_COMPONENT_INFORMATION_FAILED,
  '110005': c.ONLINE_UPDATE_NOT_FIND_FILE_ON_SERVER,
  '110006': c.ONLINE_UPDATE_NEED_RECONNECT_SERVER,
  '110007': c.ONLINE_UPDATE_CANCEL_DOWNLOADING,
  '110008': c.ONLINE_UPDATE_SAME_FILE_LIST,
  '110009': c.ONLINE_UPDATE_CONNECT_ERROR,
  '110021': c.ONLINE_UPDATE_INVALID_URL_LIST,
  '110022': c.ONLINE_UPDATE_NOT_SUPPORT_URL_LIST,
  '110023': c.ONLINE_UPDATE_NOT_BOOT,
  '110024': c.ONLINE_UPDATE_LOW_BATTERY,
  '11019': c.USSD_NET_NO_RETURN,
  '111001': c.USSD_ERROR,
  '111012': c.USSD_FUNCTION_RETURN_ERROR,
  '111013': c.USSD_IN_USSD_SESSION,
  '111014': c.USSD_TOO_LONG_CONTENT,
  '111016': c.USSD_EMPTY_COMMAND,
  '111017': c.USSD_CODING_ERROR,
  '111018': c.USSD_AT_SEND_FAILED,
  '111019': c.USSD_PROCESSING,
  '111020': c.USSD_TIMEOUT,
  '111021': c.USSD_XML_SPECIAL_CHARACTER_TRANSFER_FAILED,
  '111022': c.USSD_NET_NOT_SUPPORT_USSD,
  '112001': c.SET_NET_MODE_AND_BAND_WHEN_DIALUP_FAILED,
  '112002': c.SET_NET_SEARCH_MODE_WHEN_DIALUP_FAILED,
  '112003': c.SET_NET_MODE_AND_BAND_FAILED,
  '112004': c.SET_NET_SEARCH_MODE_FAILED,
  '112005': c.NET_REGISTER_NET_FAILED,
  '112006': c.NET_NET_CONNECTED_ORDER_NOT_MATCH,
  '112007': c.NET_CURRENT_NET_MODE_NOT_SUPPORT,
  '112008': c.NET_SIM_CARD_NOT_READY_STATUS,
  '112009': c.NET_MEMORY_ALLOC_FAILED,
  '113017': c.SMS_NULL_ARGUMENT_OR_ILLEGAL_ARGUMENT,
  '113018': c.SMS_SYSTEM_BUSY,
  '113020': c.SMS_QUERY_SMS_INDEX_LIST_ERROR,
  '113031': c.SMS_SET_SMS_CENTER_NUMBER_FAILED,
  '113036': c.SMS_DELETE_SMS_FAILED,
  '113047': c.SMS_SAVE_CONFIG_FILE_FAILED,
  '113053': c.SMS_NOT_ENOUGH_SPACE,
  '113054': c.SMS_TELEPHONE_NUMBER_TOO_LONG,
  '114001': c.SD_FILE_EXIST,
  '114002': c.SD_DIRECTORY_EXIST,
  '114004': c.SD_FILE_OR_DIRECTORY_NOT_EXIST,
  // TODO: Find out the correct code of this error
  // '114004': 'sd_is_operated_by_another_user',
  '114005': c.SD_FILE_NAME_TOO_LONG,
  '114006': c.SD_NO_RIGHT,
  '114007': c.SD_FILE_IS_UPLOADING,
  '115001': c.PB_NULL_ARGUMENT_OR_ILLEGAL_ARGUMENT,
  '115002': c.PB_OVERTIME,
  '115003': c.PB_CALL_SYSTEM_FUNCTION_ERROR,
  '115004': c.PB_WRITE_FILE_ERROR,
  '115005': c.PB_READ_FILE_ERROR,
  '115199': c.PB_LOCAL_TELEPHONE_FULL_ERROR,
  '116001': c.STK_NULL_ARGUMENT_OR_ILLEGAL_ARGUMENT,
  '116002': c.STK_OVERTIME,
  '116003': c.STK_CALL_SYSTEM_FUNCTION_ERROR,
  '116004': c.STK_WRITE_FILE_ERROR,
  '116005': c.STK_READ_FILE_ERROR,
  '117001': c.WIFI_STATION_CONNECT_AP_PASSWORD_ERROR,
  '117002': c.WIFI_WEB_PASSWORD_OR_DHCP_OVERTIME_ERROR,
  '117003': c.WIFI_PBC_CONNECT_FAILED,
  '117004': c.WIFI_STATION_CONNECT_AP_WISPR_PASSWORD_ERROR,
  '118001': c.CRADLE_GET_CURRENT_CONNECTED_USER_IP_FAILED,
  '118002': c.CRADLE_GET_CURRENT_CONNECTED_USER_MAC_FAILED,
  '118003': c.CRADLE_SET_MAC_FAILED,
  '118004': c.CRADLE_GET_WAN_INFORMATION_FAILED,
  '118005': c.CRADLE_CODING_FAILED,
  '118006': c.CRADLE_UPDATE_PROFILE_FAILED,
  '120001': c.VOICE_BUSY,
  '125001': c.WRONG_TOKEN,
  '125002': c.WRONG_SESSION,
  '125003': c.WRONG_SESSION_TOKEN,
};

export enum ErrorCategory {
  CONNECTION = 'connection',
  API = 'api',
  USSD = 'ussd',
  AJAX = 'ajax',
  SMS = 'sms',
};

// FIXME: Use RouterErrorCodes as property type once it's properly defined
const errors: { [errorCode in string]: ErrorCategory[]} = {
  'http_request_error': [ErrorCategory.CONNECTION],
  'http_request_invalid_xml': [ErrorCategory.CONNECTION],
  'http_request_invalid_status': [ErrorCategory.CONNECTION],
  'http_request_timeout': [ErrorCategory.CONNECTION],
  'http_request_no_response': [ErrorCategory.CONNECTION],
  'xml_response_not_ok': [],
  'invalid_router_url': [],
  'ussd_timeout': [ErrorCategory.USSD],
  'ussd_cancelled': [ErrorCategory.USSD],
  'ussd_release_fail': [ErrorCategory.USSD],
  'ajax_no_tokens': [ErrorCategory.AJAX],
  'sms_import_disabled': [ErrorCategory.SMS],
  'sms_import_invalid_response': [ErrorCategory.SMS],
  'sms_import_sim_empty': [ErrorCategory.SMS],
  // TODO: Check if this ever clashes with RouterApiError
  'sms_not_enough_space': [ErrorCategory.SMS],
};

for (let error of Object.values(apiErrorCodes)) {
  errors[error] = [ErrorCategory.API];
}

export function getRouterApiErrorName(code: string): RouterApiErrorCode {
  if (typeof code !== 'string') {
    throw new Error('expected router API error code to be of type string, got ' + (typeof code) + ' instead.');
  }
  return apiErrorCodes[code];
}

/**
 * Throws a RouterApiError using a code and or message.
 * @param retCode The error code of the API error
 * @param retMessage The error message, if any
 * @throws {RouterApiError}
 */
export function throwApiError(retCode: keyof typeof RouterApiErrorCode, retMessage: string | null = null) {
  const errorName = getRouterApiErrorName(retCode);
  let code = errorName ? errorName.toLowerCase() : retCode;
  let message = code;
  if (retMessage) message += ' : ' + retMessage;
  throw new RouterApiError(code, message);
}

// FIXME: Use RouterErrorCodes once it's properly defined
export function isErrorInCategory(errorCode: string, category: ErrorCategory) {
  return errors[errorCode].includes(category);
}
