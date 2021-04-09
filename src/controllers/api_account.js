/**
 * TIFX Technologies
 * Copyright (c) 2014-2021 - All rights reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Written by Bruno B. Stein <bruno.stein@tifx.com.br>, 2021
 */

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const config = require("../config");
const ApiAccountModel = require("../models/api/api_account.model");
const ApiHelper = require('../helpers/api');

const ApiAccountController = {

  getAll: (req, res) => {
    try {
      ApiHelper.checkSystemScope(req).then((isSystemScope) => {
        if (!isSystemScope) {
          return res.status(201).send({ success: false, msg: "Permission denied." });
        }
        let search = {
          scope: { "$ne": "system" }
        }
        ApiAccountModel.find(search).select("-password").then(apiAccount => {
          return res.status(201).send({ success: true, data: apiAccount });
        });
      });
    } catch (err) {
      console.log(err);
      return res.status(400).send({ success: false, msg: "Couldn't get the Api Account." });
    }
  },

  getId: (req, res) => {
    try {
      let search = {
        _id: req.params.id,
        scope: { "$ne": "system" }
      }
      ApiAccountModel.findOne(search).select("-password").then(apiAccount => {
        return res.status(201).send({ success: true, data: apiAccount });
      });
    } catch (err) {
      console.log(err);
      return res.status(400).send({ success: false, msg: "Couldn't get the Api Accounts." });
    }
  },

  signUp: async (req, res) => {
    try {
      let requestData = req.body;

      // Check required fields
      if ((requestData.email === undefined || requestData.username.length === 0) ||
        (requestData.username === undefined || requestData.username.length === 0) ||
        (requestData.password === undefined || requestData.password.length === 0) || 
        (requestData.scope === undefined || requestData.scope.length === 0)) {
        return res.status(201).send({ success: false, msg: "The field's (email, username, password and scope is required." });
      }

      // Check if the apiAccount exists
      let apiAccount = await ApiAccountModel.findOne({ username: requestData.username });
      if (apiAccount !== null) {
        return res.status(201).send({ success: false, msg: "Api Account already exists." });
      }

      // Cryptography the apiAccount password before insert it
      requestData.password = bcrypt.hashSync(requestData.password, bcrypt.genSaltSync(10), null);

      let apiAccountData = {
        email: requestData.email,
        username: requestData.username,
        password: requestData.password,
        scope: requestData.scope,
        blocked: 0,
      }

      let apiAccountObj = new ApiAccountModel(apiAccountData);

      apiAccountObj.save().then((apiAccount) => {
        if (apiAccount === null) {
          return res.status(201).send({ success: false, msg: "Couldn't create the Api Account." });
        } else {
          apiAccount.password = undefined;
          return res.status(201).send({ success: true, data: apiAccount, msg: "Api Account created successfully." });
        }
      });
    } catch (err) {
      console.log(err);
      return res.status(400).send({ success: false, msg: "Couldn't create the Api Account." });
    }
  },

  signIn: async (req, res) => {
    try {
      let requestData = req.body;

      ApiAccountModel.findOne({ username: requestData.username }).then((apiAccount) => {
        if (apiAccount == null) {
          return res.json({ success: false, msg: "Authentication failed. Api Account not found." });
        }

        bcrypt.compare(requestData.password, apiAccount.password).then(async (isMatch) => {
          if (!isMatch) {
            return res.status(201).send({ success: false, msg: 'Authentication failed, wrong username or password.' });
          }

          let apiSettings = global.apiSettings;
          let token = jwt.sign({ id: apiAccount._id, username: apiAccount.username }, apiSettings.accessTokenSecret, { expiresIn: apiSettings.accessTokenExpiresIn });
          let responseData = {
            username: apiAccount.username,
            scope: apiAccount.scope,
            access_token: token,
            token_type: apiSettings.tokenAuthScheme,
            token_expires_in: apiSettings.accessTokenExpiresIn,
          }

          // CREATE REFRESH TOKEN
          if (apiSettings.refreshTokenEnabled === "on") {
            let refreshToken = jwt.sign({ username: apiAccount.username }, apiSettings.refreshTokenSecret, { expiresIn: apiSettings.refreshTokenExpiresIn });

            let success = await ApiAccountModel.updateOne({ _id: apiAccount._id }, {"refresh_token": refreshToken});
            if (success == null || !success.ok) {
              return res.status(201).send({ success: false, msg: "Authentication failed." });
            }

            responseData.refresh_token = refreshToken;
          }

          return res.status(201).send({ success: true, data: responseData });
        });
      });
    } catch (err) {
      console.log(err);
      return res.status(400).send({ success: false, msg: "Authenticate failed." });
    }
  },

  refreshToken: async (req, res) => {
    try {
      let apiSettings = global.apiSettings;

      if (apiSettings.refreshTokenEnabled === "off") {
        return res.status(201).send({ success: false, msg: "Refresh Token disabled." });
      }

      let requestData = req.body;

      let search = {
        username: requestData.username,
        refresh_token: requestData.refresh_token
      }

      ApiAccountModel.findOne(search).then(async (apiAccount) => {
        if (apiAccount === null) {
          return res.status(201).send({ success: false, msg: "Api Account not found." });
        }

        // Check if refresh token is valid
        jwt.verify(apiAccount.refresh_token, apiSettings.refreshTokenSecret, async function(err, refreshTokenData) {
          if (err !== null || refreshTokenData === undefined || refreshTokenData.username !== apiAccount.username) {
            return res.status(401).send({ success: false, msg: "Refresh Token expired." });
          }

          // Generate new Access Token
          let token = jwt.sign({ id: apiAccount._id, username: apiAccount.username }, apiSettings.accessTokenSecret, {expiresIn: apiSettings.accessTokenExpiresIn});

          let responseData = {
            success: true,
            data: {
              username: apiAccount.username,
              scope: apiAccount.scope,
              access_token: token,
              token_type: apiSettings.tokenAuthScheme,
              token_expires_in: apiSettings.accessTokenExpiresIn,
              refresh_token: apiAccount.refresh_token
            },
            msg: "Token refreshed successfully."
          }

          return res.status(201).send(responseData);
        });
      });
    } catch (err) {
      console.log(err);
      return res.status(400).send({ success: false, msg: "Access Token Refresh failed." });
    }
  },

  refreshTokenRevoke: (req, res) => {
    try {
      let apiSettings = global.apiSettings;

      if (apiSettings.refreshTokenEnabled === "off") {
        return res.status(201).send({ success: false, msg: "Refresh Token disabled." });
      }

      ApiHelper.checkSystemScope(req).then(async (isSystemScope) => {
        if (!isSystemScope) {
          return res.status(201).send({ success: false, msg: "Permission denied." });
        }

        let requestData = req.body;

        let search = {
          username: requestData.username,
          refresh_token: requestData.refresh_token,
          scope: { "$ne": "system" } 
        }

        let apiAccount = await ApiAccountModel.findOne(search);
        if (apiAccount === null) {
          return res.status(201).send({ success: false, msg: "Api Account not found." });
        }

        ApiAccountModel.updateOne({ _id: apiAccount._id}, {"refresh_token": null}).then(updated => {
          if (updated === null || !updated.ok) {
            return res.status(201).send({ success: false, msg: "Refresh token revoke failed." });
          }
          return res.status(201).send({ success: true, msg: "Refresh token revoked successfully." });
        });
      });
    } catch (err) {
      console.log(err);
      return res.status(400).send({ success: false, msg: "Couldn't revoke the Refresh Token." });
    }
  },

  update: (req, es) => {
    try {
      let requestData = req.body;

      if (requestData.password === undefined || requestData.password.length === 0) {
        return res.status(201).send({ success: false, msg: "Password is required." });
      }

      var search = {
        _id: req.params.id,
        scope: { "$ne": "system" } 
      }

      ApiAccountModel.findOne(search).then(async apiAccount => {

        if (apiAccount === null) {
          return res.status(201).send({ success: false, msg: "Api Account not found." });
        }

        // Check if the api apiAccount exists
        if (requestData.username != apiAccount.username) {
          var search = {
            username: requestData.username
          }
          let apiAccountExists = await ApiAccountModel.findOne(search);
          if (apiAccountExists !== null) {
            return res.status(201).send({ success: false, msg: "The Api Account already exists." });
          }
        }

        requestData.password_hash = bcrypt.hashSync(requestData.password, bcrypt.genSaltSync(10), null);

        let apiAccountData = {};
        if (requestData.email !== undefined) {
          apiAccountData.email = requestData.email;
        }
        if (requestData.username !== undefined) {
          apiAccountData.username = requestData.username;
        }
        if (requestData.scope !== undefined) {
          apiAccountData.scope = requestData.scope;
        }
        if (requestData.scope !== undefined) {
          apiAccountData.blocked = requestData.blocked;
        }

        if (Object.keys(apiAccountData).length === 0) {
          return res.status(201).send({ success: false, msg: "Coundn't update Api Account: Empty fields." });
        }

        ApiAccountModel.updateOne({ _id: req.params.id }, apiAccountData).then(success => {
          if (success === null || !success.ok) {
            return res.status(201).send({ success: false,  msg: "Coundn't update Api Account." });
          }
          var search = {
            _id: req.params.id
          }
          ApiAccountModel.findOne(search).then(apiAccount => {
            if (apiAccount === null) {
              return res.status(201).send({ success: false, msg: "Coundn't update Api Account." });
            }
            return res.status(201).send({ success: true, data: apiAccount, msg: "Api Account updated successfully." });
           });
        });
      });
    } catch (err) {
      console.log(err);
      return res.status(400).send({ success: false, msg: "Coundn't update Api Account." });
    }
  },

  block: (req, res) => {
    try {
      ApiHelper.checkSystemScope(req).then((isSystemScope) => {
        if (!isSystemScope) {
          return res.status(201).send({ success: false, msg: "Permission denied." });
        }

        let data = {
          blocked: 1
        }

        ApiAccountModel.updateOne({ _id: req.params.id }, data).then(success => {
          if (success === null || ! success.ok) {
            return res.status(201).send({ success: false, msg: "Couldn't block the Api Account." });
          }

          let search = {
            _id: req.params.id,
            scope: { "$ne": "system" } 
          }

          ApiAccountModel.findOne(search).then(apiAccount => {
            if (apiAccount === null) {
              return res.status(201).send({ success: false, msg: "Api Account not found." });
            }
            apiAccount.password = undefined;
            return res.status(201).send({ success: true, data: apiAccount, msg: "Api Account blocked successfully." });
          });
        });
      });
    } catch (err) {
      console.log(err);
      return res.status(400).send({ success: false, msg: "Coundn't block the Api Account." });
    }
  },

  unblock: (req, res) => {
    try {
      ApiHelper.checkSystemScope(req).then((isSystemScope) => {
        if (!isSystemScope) {
          return res.status(201).send({ success: false, msg: "Permission denied." });
        }

        let data = {
          blocked: 0
        }

        let search = { 
          _id: req.params.id, 
          scope: { "$ne": "system" } 
        }

        ApiAccountModel.updateOne(search, data).then(success => {
          if (success === null || ! success.ok) {
            return res.status(201).send({ success: false, msg: "Couldn't unblock the Api Account." });
          }

          let search = {
            _id: req.params.id
          }
          ApiAccountModel.findOne(search).then(apiAccount => {
            if (apiAccount === null) {
              return res.status(201).send({ success: false, msg: "Api Account not found." });
            }
            apiAccount.password = undefined;
            return res.status(201).send({ success: true, data: apiAccount, msg: "Api Account unblocked successfully." });
          });
        });
      });
    } catch (err) {
      console.log(err);
      return res.status(400).send({ success: false, msg: "Coundn't Unblock the Api Account." });
    }
  },

  remove: (req, res) => {
    try {
      ApiHelper.checkSystemScope(req).then((isSystemScope) => {
        if (!isSystemScope) {
          return res.status(201).send({ success: false, msg: "Permission denied." });
        }

        let search = {
          _id: req.params.id,
          scope: { "$ne": "system" } 
        }

        ApiAccountModel.deleteOne(search).then(success => {
          if (success === null || !success.ok) {
            return res.status(201).send({ success: false, msg: "Couldn't remove the Api Account." });
          }
          return res.status(201).send({ success: true, msg: "Api Account removed successfully." });
        });
      });
    } catch (err) {
      console.log(err);
      return res.status(400).send({ success: false, msg: "Coundn't remove the Api Account." });
    }
  }
}

module.exports = ApiAccountController;
