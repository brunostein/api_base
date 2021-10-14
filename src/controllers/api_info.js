/**
 * TIFX Technologies
 * Copyright (c) 2014-2021 - All rights reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Written by Bruno B. Stein <bruno.stein@tifx.com.br>, 2021
 */

const config = require("../config");
const apiHelper = require('../helpers/api');

const ApiInfoController = {

  getInfo: (req, res) => {
    try {
      apiHelper.checkSystemScope(req).then(async (isSystemScope) => {
        if (!isSystemScope) {
          return res.status(201).send({ success: false, msg: "Permission denied." });
        }

        let info = {
          api: config.api,
          settings: await apiHelper.getApiSettings()
        };

        return res.status(201).send({ success: true, data: info });
      });
    } catch (err) {
      console.log(err);
      return res.status(500).send({ success: false, msg: "Couldn't get the Api Info." });
    }
  },

}

module.exports = ApiInfoController;
