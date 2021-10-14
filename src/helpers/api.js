/**
 * TIFX Technologies
 * Copyright (c) 2014-2021 - All rights reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Written by Bruno B. Stein <bruno.stein@tifx.com.br>, 2021
 */

const jwt = require('jsonwebtoken');
const requestIp = require('request-ip');
const ApiAccountModel = require("../models/api/api_account.model");
const ApiSettingsModel = require("../models/api/api_settings.model");
const ApiAccessesHistoryModel = require("../models/api/api_accesses_history.model");

const getApiSettings = async () => {
  let settings = await ApiSettingsModel.findOne();
  return settings;
}

const apiMiddleware = async (req, res, next) => {
  try {
    if (!req.originalUrl.match("/api") || req.originalUrl.match("/accounts/signup")) {
      next();
      return;
    }

    let username = null;

    if (req.originalUrl.match("/accounts/signin") || 
      req.originalUrl.match("/accounts/refresh-token")) {
      if (req.body.username !== undefined) {
        username = req.body.username;
      }
    } else {
      let authorizationData = await getAuthorizationInfo(req.headers);
      if (authorizationData !== null && authorizationData.username !== undefined) {
        username = authorizationData.username;
      }
    }

    if (username === null) {
      next();
      return;
    }

    // STORE ACCESSES HISTORY
    if (global.apiSettings.storeAccessesHistoryEnabled === "on") {
      let historyData = {
        username,
        api_endpoint: req.originalUrl,
        ipaddress: requestIp.getClientIp(req) || null
      };

      await ApiAccessesHistoryModel.create(historyData);
    }

    // Check Blocked Account
    ApiAccountModel.findOne({ username: username }).then((apiAccount) => {
      if (apiAccount === null) {
        return res.status(201).send({ success: false, msg: "Api Account not found." });
      }
      if (apiAccount.blocked === true) {
        return res.status(201).send({ success: false, msg: "Api Account blocked." }); 
      }
      next();
    });
  } catch (err) {
    console.log(err);
    return res.status(400).send(err);
  }
}

const checkScope = async function (username, scope) {
  try {
    let search = {
      username: username
    }
    let apiAccount = await ApiAccountModel.findOne(search);

    if (apiAccount === null) {
      return res.status(201).send({success: false, msg: "Api Account not found."})
    } else if (apiAccount.scope === scope) {
      return true;
    }
  } catch (err) {
    console.log(err);
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
    console.log(err);
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
  getApiSettings,
  apiMiddleware,
  checkScope,
  checkSystemScope,
  getAuthorizationInfo,
  getToken,
  resetNeedReboot,
}

module.exports = apiHelper;
