/**
 * TIFX Technologies
 * Copyright (c) 2014-2021 - All rights reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Written by Bruno B. Stein <bruno.stein@tifx.com.br>, 2021
 */

const config = require('../config');
const ApiSettingsModel = require("../models/api/api_settings.model");
const apiHelper = require('../helpers/api');

const apiSettings = {

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

        let apiSettingsData = {
          port: data.port,
          name: data.name,
          descr: data.descr,
          tokenAuthScheme: data.tokenAuthScheme,
          accessTokenSecret: data.accessTokenSecret,
          accessTokenExpiresIn: data.accessTokenExpiresIn,
          refreshTokenEnabled: data.refreshTokenEnabled,
          refreshTokenSecret: data.refreshTokenSecret,
          refreshTokenExpiresIn: data.refreshTokenExpiresIn
        };

        ApiSettingsModel.updateOne({}, apiSettingsData).then(success => {
          if (success === null || !success.ok) {
            return res.status(201).send({ success: false,  msg: "Couldn't update the Api Settings." });
          }

          ApiSettingsModel.findOne().then(newApiSettings => {
            if (newApiSettings === null) {
              return res.status(201).send({ success: false,  msg: "Couldn't get the Api Settings." });
            }

            global.apiSettings = newApiSettings;

            return res.status(201).send({ success: true, data: newApiSettings, msg: "Api Settings updated successfully."  });
          });
        });
      });
    } catch (err) {
      console.log(err);
      return res.status(500).send({ success: false, msg: "Couldn't update the Api Settings." });
    }
  }
}

module.exports = apiSettings;
