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
      apiHelper.checkSystemScope(req).then((isSystemScope) => {
        let info = {
          api: config.api,
          settings: global.apiSettings
        }
        return res.status(201).send({ success: true, data: info });
      });
    } catch (err) {
      console.log(err);
      return res.status(201).send({ success: false, msg: "Couldn't get the Api Info." });
    }
  },

}

module.exports = ApiInfoController;
