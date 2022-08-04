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
    let apiName = config.api.name;

    consoleLog("Installing " + apiName + "...");

    let userData = {
      email: process.env.API_ROOT_ACCOUNT_EMAIL,
      username: process.env.API_ROOT_ACCOUNT_USER,
      password: bcrypt.hashSync(process.env.API_ROOT_ACCOUNT_PASS, bcrypt.genSaltSync(10), null),
      scope: "system",
      blocked: 0,
      system: 1
    };

    let ApiAccountObj = new ApiAccountModel(userData);

    consoleLog("Creating ROOT Account...");

    ApiAccountObj.save().then((data) => {
      if (data === null) {
        let errMessage = "Couldn't create the Root Account.";
        consoleLog(errMessage);
        reject(errMessage);
        process.exit(1);
      }
      
      consoleLog("ROOT Account created successfully...");

      let apiSettingsData = {
        companyName: process.env.COMPANY_NAME || null,
        companyWebsite: process.env.COMPANY_WEBSITE || null,
        companySupportEmail: process.env.COMPANY_SUPPORT_EMAIL || null,
        name: process.env.API_NAME || config.api.name,
        descr: process.env.API_DESCR,
        tokenAuthScheme: process.env.API_TOKEN_AUTH_SCHEME,
        accessTokenSecret: process.env.API_ACCESS_TOKEN_SECRET,
        accessTokenExpiresIn: process.env.API_ACCESS_TOKEN_EXPIRES_IN,
        refreshTokenEnabled: process.env.API_REFRESH_TOKEN_ENABLED,
        refreshTokenSecret: process.env.API_REFRESH_TOKEN_SECRET,
        refreshTokenExpiresIn: process.env.API_REFRESH_TOKEN_EXPIRES_IN,
        storeAccessesHistoryEnabled: process.env.API_STORE_ACCESSES_HISTORY_ENABLED,
        needReboot: false,
        swaggerHost: process.env.SWAGGER_HOST || config.api.host,
        swaggerPort: process.env.SWAGGER_PORT || config.api.port,
        swaggerPath: process.env.SWAGGER_PATH || "/doc",
        cache: {
          enabled: false,
          prefix: '__rest_api_base__',
          type: 'redis',
          redis: {
            host: 'localhost',
            port: 7000,
            pass: "",
            defaultExpirationTime: 300,
            randomExpiration: true,
            randomExpirationMinNumber: 60,
            randomExpirationMaxNumber: 600
          }
        }
      };

      let apiSettingsObj = new ApiSettingsModel(apiSettingsData);
      
      consoleLog("Creating API Settings...");

      apiSettingsObj.save().then((data) => {
        if (data === null) {
          let errMessage = "Couldn't create the Api Settings.";
          consoleLog(errMessage);
          reject(errMessage);
          process.exit(1);
        }

        consoleLog("API Settings created successfully...");
        consoleLog("Installation completed successfully.");

        resolve(data);
      })
    })
  } catch (err) {
    consoleLog("Couldn't install the " + apiName);
    consoleLog(err);

    reject(err);
  }
})

module.exports = install;
