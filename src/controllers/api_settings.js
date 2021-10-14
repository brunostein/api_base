/**
 * TIFX Technologies
 * Copyright (c) 2014-2021 - All rights reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Written by Bruno B. Stein <bruno.stein@tifx.com.br>, 2021
 */

const ApiSettingsModel = require("../models/api/api_settings.model");
const apiHelper = require('../helpers/api');

const ApiSettingsController = {

  get: (req, res) => {
    try {
      apiHelper.checkSystemScope(req).then((isSystemScope) => {
        if (!isSystemScope) {
          return res.status(201).send({ success: false, msg: "Permission denied." });
        }

        ApiSettingsModel.findOne().then(apiSettings => {
          return res.status(201).send({ success: true, data: apiSettings });
        })
      });
    } catch (err) {
      console.log(err);
      return res.status(500).send({ success: false, msg: "Couldn't get the Api Settings." });
    }
  },

  update: async (req, res) => {
    try {
      apiHelper.checkSystemScope(req).then((isSystemScope) => {
        if (!isSystemScope) {
          return res.status(201).send({success: false, msg: "Permission denied." });
        }

        let data = req.body;
        let apiSettingsData = {};

        if (data.companyName) {
          apiSettingsData.companyName = data.companyName;
        }
        if (data.companyWebsite) {
          apiSettingsData.companyWebsite = data.companyWebsite;
        }
        if (data.companySupportEmail) {
          apiSettingsData.companySupportEmail = data.companySupportEmail;
        }
        if (data.name) {
          apiSettingsData.name = data.name;
        }
        if (data.descr) {
          apiSettingsData.descr = data.descr;
        }
        if (data.tokenAuthScheme) {
          apiSettingsData.tokenAuthScheme = data.tokenAuthScheme;
        }
        if (data.accessTokenSecret) {
          apiSettingsData.accessTokenSecret = data.accessTokenSecret;
        }
        if (data.accessTokenExpiresIn) {
          apiSettingsData.accessTokenExpiresIn = data.accessTokenExpiresIn;
        }
        if (data.refreshTokenEnabled) {
          apiSettingsData.refreshTokenEnabled = data.refreshTokenEnabled;
        }
        if (data.refreshTokenSecret) {
          apiSettingsData.refreshTokenSecret = data.refreshTokenSecret;
        }
        if (data.refreshTokenExpiresIn) {
          apiSettingsData.refreshTokenExpiresIn = data.refreshTokenExpiresIn;
        }
        if (data.storeAccessesHistoryEnabled) {
          apiSettingsData.storeAccessesHistoryEnabled = data.storeAccessesHistoryEnabled;
        }
        if (data.swaggerHost) {
          apiSettingsData.swaggerHost = data.swaggerHost;
        }
        if (data.swaggerPort) {
          apiSettingsData.swaggerPort = data.swaggerPort;
        }
        if (data.swaggerPath) {
          apiSettingsData.swaggerPath = data.swaggerPath;
        }

        // Need Reboot after update
        apiSettingsData.needReboot = true;

        ApiSettingsModel.findOneAndUpdate({}, apiSettingsData, { returnOriginal: false }).then(newApiSettings => {
          if (newApiSettings === null) {
            return res.status(201).send({ success: false,  msg: "Couldn't get the Api Settings." });
          }

          return res.status(201).send({ success: true, data: newApiSettings, msg: "Api Settings updated successfully. It is necessary restart the API for the changes to take effect."  });
        });
      });
    } catch (err) {
      console.log(err);
      return res.status(500).send({ success: false, msg: "Couldn't update the Api Settings." });
    }
  }
}

module.exports = ApiSettingsController;
