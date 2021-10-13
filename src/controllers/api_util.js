/**
 * TIFX Technologies
 * Copyright (c) 2014-2021 - All rights reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Written by Bruno B. Stein <bruno.stein@tifx.com.br>, 2021
 */

const fs = require('fs');
const { spawn } = require('child_process');
const ApiHelper = require('../helpers/api');

const ApiUtilController = {

  shutdown: (req, res) => {
    try {
      ApiHelper.checkSystemScope(req).then((isSystemScope) => {
        if (!isSystemScope) {
          return res.status(201).send({ success: false, msg: "Permission denied." });
        }

        setTimeout(function () {
          process.on("exit", function () {
            return res.status(201).send({ success: true, msg: "System shut down successfully." });
          });
          process.exit();
        }, 1000);
      });
    } catch (err) {
      console.log(err);
      return res.status(500).send({ success: false, msg: "Couldn't shut down the system." });
    }
  },

  reboot: (req, res) => {
    try {
      ApiHelper.checkSystemScope(req).then((isSystemScope) => {
        if (!isSystemScope) {
          return res.status(201).send({ success: false, msg: "Permission denied." });
        }

        setTimeout(function () {
          process.on("exit", function () {
            spawn(process.argv.shift(), process.argv, {
              cwd: process.cwd(),
              detached : true,
              stdio: "inherit"
            });
            return res.status(201).send({ success: true, msg: "System restarted successfully" });
          });
          process.exit();
        }, 1000);
      });
    } catch (err) {
      console.log(err);
      return res.status(500).send({ success: false, msg: "Couldn't restart the system." });
    }
  },

  ping: (req, res) => {
    try {
      return res.status(201).send({ success: true, data: "pong" });
    } catch (err) {
      console.log(err);
      return res.status(500).send({ success: false, msg: "Ping failed." });
    }
  },

}

module.exports = ApiUtilController;