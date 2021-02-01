'use strict';
import * as ajax from '@/ajax';
import config from '@/config';
import * as utils from '@/utils';

interface StateLogin {
  State: number,
  Username: string,
  password_type: number,
};

export async function getLoginState(): Promise<StateLogin> {
  const data = await ajax.getAjaxData({url: 'api/user/state-login'});
  return {
    State: parseInt(data.State, 10),
    Username: data.Username,
    password_type: parseInt(data.password_type, 10),
  };
}

export async function isLoggedIn(): Promise<boolean> {
  const ret = await getLoginState();
  if (ret.State === 0) {
    return true;
  } else {
    return false;
  }
}

export async function login() {
  // This should be first so getLoginState can reuse the tokens
  const tokens = await ajax.getTokens(true);
  const loginState = await getLoginState();
  const loginDetails = config.getLoginDetails();
  let processedPassword;
  if (tokens.length > 0 && loginState.password_type === 4) {
    processedPassword = utils.base64encode(utils.sha256(loginDetails.username +
        utils.base64encode(utils.sha256(loginDetails.password)) + tokens[0]));
  } else {
    processedPassword = utils.base64encode(loginDetails.password);
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
