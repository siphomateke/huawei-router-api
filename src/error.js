'use strict';
import ExtendableError from 'es6-error';

export class RouterError extends ExtendableError {
  constructor(code, message) {
    super(typeof message !== 'undefined' ? message : code);
    this.code = code;
  }
}

export class RouterApiError extends RouterError {
  constructor(code, message) {
    super('api_'+code, message);
  }
}

export class RequestError extends RouterError {
  constructor(code, message) {
    super('http_request_'+code, message);
  }
}

export const apiErrorCodes = {
  100002: 'system_no_support',
  100003: 'system_no_rights',
  100004: 'system_busy',
  108001: 'login_username_wrong',
  108002: 'login_password_wrong',
  108003: 'login_already_login',
  108006: 'login_username_pwd_wrong',
  108007: 'login_username_pwd_orerrun',
  120001: 'voice_busy',
  125001: 'wrong_token',
  125002: 'wrong_session',
  125003: 'wrong_session_token',
  111019: 'ussd_processing',
  111020: 'ussd_timeout',
  113018: 'sms_system_busy',
  113053: 'sms_not_enough_space',
};

/* const errors = [
  'http_request_error',
  'http_request_invalid_xml',
  'http_request_invalid_status',
  'http_request_timeout',
  'xml_response_not_ok',
  'invalid_router_url',
  'ussd_timeout',
  'ussd_release_fail',
  'ajax_no_tokens'
];*/

export function getRouterApiErrorName(code) {
  return apiErrorCodes[code];
}
