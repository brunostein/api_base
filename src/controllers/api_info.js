/**
 * TIFX Technologies
 * Copyright (c) 2014-2021 - All rights reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Written by Bruno B. Stein <bruno.stein@tifx.com.br>, 2021
 */

const fs = require('fs');
const osu = require('node-os-utils')
const config = require("../config");
const apiHelper = require('../helpers/api');

const ApiInfoController = {

  getInfo: (req, res) => {
    try {
      apiHelper.checkSystemScope(req).then(async (isSystemScope) => {
        if (!isSystemScope) {
          return res.status(201).send({ success: false, msg: "Permission denied." });
        }

        let uptime = osu.os.uptime();
        let cpuInfo = {
          usage: await osu.cpu.usage(),
          average: await osu.cpu.average(),
          free: await osu.cpu.free(),
          count: await osu.cpu.count()
        };
 
        let info = {
          system: {
            cpu: cpuInfo
          },
          uptime,
          api: config.api,
          settings: await apiHelper.getApiSettings()
        };

        return res.status(201).send({ success: true, data: info });
      });
    } catch (err) {
      consoleLog(err);
      return res.status(500).send({ success: false, msg: "Couldn't get the Api Info." });
    }
  },

  getRoutes: (req, res) => {
    try {
      let routesJSON = fs.readFileSync(`${config.rootPath}/routes.json`);
      let routes = JSON.parse(routesJSON);

      return res.status(201).send({ success: true, data: routes });
    } catch (err) {
      consoleLog(err);
      return res.status(500).send({ success: false, msg: "Error get Server uptime." });
    }
  },

}

module.exports = ApiInfoController;
