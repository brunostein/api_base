/**
 * TIFX Technologies
 * Copyright (c) 2014-2021 - All rights reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Written by Bruno B. Stein <bruno.stein@tifx.com.br>, 2021
 */

const jwt = require('jsonwebtoken');
const ApiAccountModel = require("../models/api/api_account.model");
const ApiSettingsModel = require("../models/api/api_settings.model");
const config = require('../config');

const consoleLog = (data) => {
  let apiName = config.api.name;
  let apiVersion = config.api.version;

  console.log(`* ${apiName} v${apiVersion}: ${data}`);
}

const getApiSettings = async () => {
  let settings = await ApiSettingsModel.findOne();
  return settings;
}

const checkScope = async function (username, scope) {
  try {
    let search = {
      username: username
    };
    let apiAccount = await ApiAccountModel.findOne(search);

    if (apiAccount === null) {
      return res.status(201).send({success: false, msg: "Api Account not found."})
    } else if (apiAccount.scope === scope) {
      return true;
    }
  } catch (err) {
    consoleLog(err);
  }

  return false;
}

const checkSystemScope = async function (req) {
  return getAuthorizationInfo(req.headers).then(async (authorizationData) => {
    if (authorizationData !== null) {
      return checkScope(authorizationData.username, 'system');
    }
  });
}

const getAuthorizationInfo = async function (headers) {
  try {
    var token = getToken(headers);
    if (token !== null) {
      return jwt.verify(token, global.apiSettings.accessTokenSecret);
    }
  } catch {}

  return null;
};

const getToken = function (headers) {
  try {
    if (headers && headers.authorization !== undefined) {
      var parted = headers.authorization.split(' ');
      if (parted.length === 2) {
        return parted[1];
      }
    }
  } catch (err) {
    consoleLog(err);
  }

  return null;
};

const resetNeedReboot = async (reboot = false) => {
  let apiSettingsData = {
    needReboot: reboot
  };
  return await ApiSettingsModel.updateOne({}, apiSettingsData);
}

const apiHelper = {
  consoleLog,
  getApiSettings,
  checkScope,
  checkSystemScope,
  getAuthorizationInfo,
  getToken,
  resetNeedReboot,
}

module.exports = apiHelper;
