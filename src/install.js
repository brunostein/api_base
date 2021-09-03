/**
 * TIFX Technologies
 * Copyright (c) 2014-2021 - All rights reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Written by Bruno B. Stein <bruno.stein@tifx.com.br>, 2021
 */

const bcrypt = require('bcrypt');
const ApiAccountModel = require("./models/api/api_account.model");
const ApiSettingsModel = require("./models/api/api_settings.model");
const config = require("./config");

const install = () => new Promise((resolve, reject) => {
  try {
    let apiName = process.env.API_NAME;

    console.log("Installing " + apiName + "...");

    let userData = {
      email: process.env.API_ROOT_ACCOUNT_EMAIL,
      username: process.env.API_ROOT_ACCOUNT_USER,
      password: bcrypt.hashSync(process.env.API_ROOT_ACCOUNT_PASS, bcrypt.genSaltSync(10), null),
      scope: "system",
      blocked: 0
    };

    let ApiAccountObj = new ApiAccountModel(userData);

    console.log("Creating ROOT Account...");

    ApiAccountObj.save().then((data) => {
      if (data === null) {
        let errMessage = "Couldn't create the Root Account.";
        console.log(errMessage);
        reject(errMessage);
        process.exit(1);
      }
      
      console.log("ROOT Account created successfully...");

      let apiSettingsData = {
        name: process.env.API_NAME || config.api.name,
        descr: process.env.API_DESCR,
        tokenAuthScheme: process.env.API_TOKEN_AUTH_SCHEME,
        accessTokenSecret: process.env.API_ACCESS_TOKEN_SECRET,
        accessTokenExpiresIn: process.env.API_ACCESS_TOKEN_EXPIRES_IN,
        refreshTokenEnabled: process.env.API_REFRESH_TOKEN_ENABLED,
        refreshTokenSecret: process.env.API_REFRESH_TOKEN_SECRET,
        refreshTokenExpiresIn: process.env.API_REFRESH_TOKEN_EXPIRES_IN
      };

      let apiSettingsObj = new ApiSettingsModel(apiSettingsData);
      
      console.log("Creating API Settings...");

      apiSettingsObj.save().then((data) => {
        if (data === null) {
          let errMessage = "Couldn't create the Api Settings.";
          console.log(errMessage);
          reject(errMessage);
          process.exit(1);
        }

        console.log("API Settings created successfully...");
        console.log("Installation completed successfully.");

        resolve(data);
      })
    })
  } catch (err) {
    console.log("Couldn't install the " + apiName);
    console.log(err);

    reject(err);
  }
})

module.exports = install;
