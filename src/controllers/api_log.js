/**
 * TIFX Technologies
 * Copyright (c) 2014-2021 - All rights reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Written by Bruno B. Stein <bruno.stein@tifx.com.br>, 2021
 */

const config = require("../config");
const apiHelper = require('../helpers/api');
const { exec } = require('child_process');

const ApiLogController = {

  getLogLines: (req, res) => {
    try {
      apiHelper.checkSystemScope(req).then((isSystemScope) => {
        if (!isSystemScope) {
          return res.status(201).send({ success: false, msg: "Permission denied." });
        }

        let totalLines = req.query.lines || 15;
        let filters = req.query.filters || "";
        let logFile = config.rootPath + "/log/access.log";
        let cmd = `tail -${totalLines} ${logFile}`;

        if (filters !== "") {
          cmd += ` | grep ${filters}`;
        }

        exec(cmd, (error, stdout, stderr) => {
          if (error) {
            return res.status(201).send({ success: false, data: error.message });
          }

          if (stderr) {
            return res.status(201).send({ success: false, data: stderr });
          }

          return res.status(201).send({ success: true, data: stdout });
        });
      });
    } catch (err) {
      console.log(err);
      return res.status(500).send({ success: false, msg: "Couldn't get the Log lines." });
    }
  },

}

module.exports = ApiLogController;
