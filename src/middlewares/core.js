/**
 * TIFX Technologies
 * Copyright (c) 2014-2021 - All rights reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Written by Bruno B. Stein <bruno.stein@tifx.com.br>, 2021
 */

const requestIp = require('request-ip');
const ApiAccountModel = require("../models/api/api_account.model");
const ApiAccessesHistoryModel = require("../models/api/api_accesses_history.model");
const apiHelper = require('../helpers/api');

const coreMiddleware = async (req, res, next) => {
  try {
    let url = req.originalUrl || req.url;

    if (!url.match("/api") || url.match("/accounts/signup")) {
      next();
      return;
    }

    // EXTRACT USERNAME FROM REQUEST
    let username = null;

    if (url.match("/accounts/signin") ||
      url.match("/accounts/refresh-token")) {
      if (req.body.username !== undefined) {
        username = req.body.username;
      }
    } else {
      let authorizationData = await apiHelper.getAuthorizationInfo(req.headers);
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
        api_endpoint: url,
        ipaddress: requestIp.getClientIp(req) || null
      };

      await ApiAccessesHistoryModel.create(historyData);
    }

    // Check Blocked Account
    let apiAccount = await ApiAccountModel.findOne({ username: username });
    if (apiAccount === null) {
      return res.status(201).send({ success: false, msg: "Api Account not found." });
    }
    if (apiAccount.blocked === true) {
      return res.status(201).send({ success: false, msg: "Api Account blocked." }); 
    }
  } catch (err) {
    consoleLog(err);
    return res.status(400).send(err);
  }

  next();
}

module.exports = coreMiddleware;
