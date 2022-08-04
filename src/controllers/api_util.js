/**
 * TIFX Technologies
 * Copyright (c) 2014-2021 - All rights reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Written by Bruno B. Stein <bruno.stein@tifx.com.br>, 2021
 */

const child = require('child_process');
const apiHelper = require('../helpers/api');

const ApiUtilController = {

  shutdown: (req, res) => {
    try {
      apiHelper.checkSystemScope(req).then((isSystemScope) => {
        if (!isSystemScope) {
          return res.status(201).send({ success: false, msg: "Permission denied." });
        }

        setTimeout(function () {
          process.on("exit", function () {
            apiHelper.resetNeedReboot();
            return res.status(201).send({ success: true, msg: "System shut down successfully." });
          });
          process.exit();
        }, 1000);
      });
    } catch (err) {
      consoleLog(err);
      return res.status(500).send({ success: false, msg: "Couldn't shut down the system." });
    }
  },

  reboot: (req, res) => {
    try {
      apiHelper.checkSystemScope(req).then((isSystemScope) => {
        if (!isSystemScope) {
          return res.status(201).send({ success: false, msg: "Permission denied." });
        }

        setTimeout(function () {
          process.on("exit", function () {
            child.spawn(process.argv.shift(), process.argv, {
              cwd: process.cwd(),
              detached : true,
              stdio: "inherit"
            });

            apiHelper.resetNeedReboot();
            return res.status(201).send({ success: true, msg: "System restarted successfully" });
          });
          process.exit();
        }, 1000);
      });
    } catch (err) {
      consoleLog(err);
      return res.status(500).send({ success: false, msg: "Couldn't restart the system." });
    }
  },

  ping: (req, res) => {
    try {
      return res.status(201).send({ success: true, data: "pong" });
    } catch (err) {
      consoleLog(err);
      return res.status(500).send({ success: false, msg: "Ping failed." });
    }
  },

}

module.exports = ApiUtilController;