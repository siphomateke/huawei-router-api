'use strict';
import * as ajax from './ajax';
import * as config from './config';
import shajs from 'sha.js';

/**
 * @typedef StateLogin
 * @property {number} State
 * @property {string} Username
 * @property {number} password_type
 */

/**
 * @return {Promise<StateLogin>}
 */
export function getLoginState() {
  return ajax.getAjaxData({url: 'api/user/state-login'}).then((data) => {
    return {
      State: parseInt(data.State),
      Username: data.Username,
      password_type: parseInt(data.password_type),
    };
  });
}

export function isLoggedIn() {
  return getLoginState().then((ret) => {
    if (ret.State === 0) {
      return true;
    } else {
      return false;
    }
  });
}

function sha256(str) {
  return shajs('sha256').update(str).digest('hex');
}

export async function login() {
  const loginState = await getLoginState();
  const loginDetails = config.getLoginDetails();
  const tokens = await ajax.getTokens();
  let processedPassword;
  if (tokens.length > 0 && loginState.password_type === 4) {
    processedPassword = btoa(sha256(loginDetails.username +
        btoa(sha256(loginDetails.password)) + tokens[0]));
  } else {
    processedPassword = btoa(loginDetails.password);
  }
  return ajax.saveAjaxData({
    url: 'api/user/login',
    request: {
      Username: loginDetails.username,
      Password: processedPassword,
      password_type: loginState.password_type,
    },
    responseMustBeOk: true,
    enc: false,
  });
}
