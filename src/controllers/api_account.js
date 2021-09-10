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
const ApiRefreshTokenModel = require("../models/api/api_refresh_tokens.model");
const ApiAccessHistoryModel = require("../models/api/api_accesses_history.model");
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
        };

        ApiAccountModel.find(search).select("-password").then(apiAccount => {
          return res.status(201).send({ success: true, data: apiAccount });
        });
      });
    } catch (err) {
      console.log(err);
      return res.status(500).send({ success: false, msg: "Couldn't get the Api Account." });
    }
  },

  getId: (req, res) => {
    try {
      let search = {
        _id: req.params.id,
        scope: { "$ne": "system" }
      };

      ApiAccountModel.findOne(search).select("-password").then(apiAccount => {
        return res.status(201).send({ success: true, data: apiAccount });
      });

    } catch (err) {
      console.log(err);
      return res.status(500).send({ success: false, msg: "Couldn't get the Api Accounts." });
    }
  },

  signUp: async (req, res) => {
    try {
      let requestData = req.body;

      // Check required fields
      if ((!requestData.email || requestData.username.length === 0) ||
        (!requestData.username || requestData.username.length === 0) ||
        (!requestData.password || requestData.password.length === 0) || 
        (!requestData.scope || requestData.scope.length === 0)) {
        return res.status(201).send({ success: false, msg: "The field's (email, username, password and scope) are required." });
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
      };

      let apiAccountObj = new ApiAccountModel(apiAccountData);

      apiAccountObj.save().then((apiAccount) => {
        if (apiAccount === null) {
          return res.status(201).send({ success: false, msg: "Couldn't create the Api Account." });
        }

        apiAccount.password = undefined;
        return res.status(201).send({ success: true, data: apiAccount, msg: "Api Account created successfully." });
      });
    } catch (err) {
      console.log(err);
      return res.status(500).send({ success: false, msg: "Couldn't create the Api Account." });
    }
  },

  signIn: async (req, res) => {
    try {
      let requestData = req.body;

      ApiAccountModel.findOne({ username: requestData.username }).then(async (apiAccount) => {
        if (apiAccount == null) {
          return res.json({ success: false, msg: "Authentication failed. Api Account not found." });
        }

        apiAccount.auth_stats.total_attempts = apiAccount.auth_stats.total_attempts+1;

        bcrypt.compare(requestData.password, apiAccount.password).then(async (isMatch) => {
          if (!isMatch) {
            apiAccount.auth_stats.total_failed = apiAccount.auth_stats.total_failed+1;
            await apiAccount.save();

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
          };

          // CREATE REFRESH TOKEN
          if (apiSettings.refreshTokenEnabled === "on") {
            let refreshToken = jwt.sign({ username: apiAccount.username }, apiSettings.refreshTokenSecret, { expiresIn: apiSettings.refreshTokenExpiresIn });

            let refreshTokenData = {
              username: apiAccount.username,
              refresh_token: refreshToken
            };

            let refreshTokenCreated = await ApiRefreshTokenModel.create(refreshTokenData);

            if (refreshTokenCreated === null) {
              apiAccount.auth_stats.total_failed = apiAccount.auth_stats.total_failed+1;
              await apiAccount.save();

              return res.status(201).send({ success: false, msg: "Authentication failed. Couldn't create the refresh token." });
            }

            responseData.refresh_token = refreshToken;
            responseData.refresh_token_expires_in = apiSettings.refreshTokenExpiresIn;
          }

          apiAccount.auth_stats.total_success = apiAccount.auth_stats.total_success+1;
          apiAccount.auth_stats.last = Date.now();
          await apiAccount.save();

          return res.status(201).send({ success: true, data: responseData, msg: "Authenticated successfully" });
        });
      });
    } catch (err) {
      console.log(err);
      return res.status(500).send({ success: false, msg: "Authenticate failed." });
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
      };

      ApiRefreshTokenModel.findOne(search).then(async (userRefreshToken) => {
        if (userRefreshToken === null) {
          return res.status(201).send({ success: false, msg: "Refresh Token not found." });
        }

        userRefreshToken.refresh_stats.total_attempts = userRefreshToken.refresh_stats.total_attempts+1;

        if (userRefreshToken.revoked === true) {
          userRefreshToken.refresh_stats.total_failed = userRefreshToken.refresh_stats.total_failed+1;
          await userRefreshToken.save();

          return res.status(401).send({ success: false, msg: "Refresh Token was revoked." });
        }

        // Check if refresh token is valid
        jwt.verify(userRefreshToken.refresh_token, apiSettings.refreshTokenSecret, async function(err, refreshTokenData) {

          if (err !== null || !refreshTokenData || refreshTokenData.username !== userRefreshToken.username) {
            userRefreshToken.refresh_stats.total_failed = userRefreshToken.refresh_stats.total_failed+1;
            await userRefreshToken.save();

            return res.status(401).send({ success: false, msg: "Refresh Token expired." });
          }
          
          let search = {
            username: userRefreshToken.username
          };

          let apiAccount = await ApiAccountModel.findOne(search);

          // Generate new Access Token
          let token = jwt.sign({ id: apiAccount._id, username: apiAccount.username }, apiSettings.accessTokenSecret, {expiresIn: apiSettings.accessTokenExpiresIn});

          let responseData = {
            success: true,
            data: {
              access_token: token
            },
            msg: "Token refreshed successfully."
          };

          userRefreshToken.refresh_stats.total_success = userRefreshToken.refresh_stats.total_success+1;
          userRefreshToken.refresh_stats.last = Date.now();
          await userRefreshToken.save();

          return res.status(201).send(responseData);
        });
      });
    } catch (err) {
      console.log(err);
      return res.status(500).send({ success: false, msg: "Access Token Refresh failed." });
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
        };

        let refreshToken = await ApiRefreshTokenModel.findOne(search);

        if (refreshToken === null) {
          return res.status(201).send({ success: false, msg: "Refresh Token not found." });
        }

        let authorizationData = await ApiHelper.getAuthorizationInfo(req.headers);

        refreshToken.revoked = 1;
        refreshToken.revoked_at = Date.now();
        refreshToken.revoked_by_username = authorizationData.username;
        refreshToken.save();

        return res.status(201).send({ success: true, msg: "Refresh token revoked successfully." });
      });
    } catch (err) {
      console.log(err);
      return res.status(500).send({ success: false, msg: "Couldn't revoke the Refresh Token." });
    }
  },

  update: (req, es) => {
    try {
      let requestData = req.body;

      if (!requestData.password || requestData.password.length === 0) {
        return res.status(201).send({ success: false, msg: "Password is required." });
      }

      let search = {
        _id: req.params.id,
        scope: { "$ne": "system" } 
      };

      ApiAccountModel.findOne(search).then(async (apiAccount) => {
        if (apiAccount === null) {
          return res.status(201).send({ success: false, msg: "Api Account not found." });
        }

        // Check if the api apiAccount exists
        if (requestData.username !== apiAccount.username) {
          let search = {
            username: requestData.username
          };

          let apiAccountExists = await ApiAccountModel.findOne(search);

          if (apiAccountExists !== null) {
            return res.status(201).send({ success: false, msg: "The Api Account already exists." });
          }
        }

        requestData.password_hash = bcrypt.hashSync(requestData.password, bcrypt.genSaltSync(10), null);

        let apiAccountData = {};

        if (requestData.email) {
          apiAccountData.email = requestData.email;
        }
        if (requestData.username) {
          apiAccountData.username = requestData.username;
        }
        if (requestData.scope) {
          apiAccountData.scope = requestData.scope;
        }
        if (requestData.scope) {
          apiAccountData.blocked = requestData.blocked;
        }

        if (Object.keys(apiAccountData).length === 0) {
          return res.status(201).send({ success: false, msg: "Couldn't update Api Account: Empty fields." });
        }

        apiAccount.save(apiAccountData).then(apiAccountUpdated => {
          if (apiAccountUpdated === null) {
            return res.status(201).send({ success: false,  msg: "Couldn't update Api Account." });
          }

          let search = {
            _id: req.params.id
          };

          return res.status(201).send({ success: true, data: apiAccountUpdated, msg: "Api Account updated successfully." });
        });
      });
    } catch (err) {
      console.log(err);
      return res.status(500).send({ success: false, msg: "Couldn't update Api Account." });
    }
  },

  block: (req, res) => {
    try {
      ApiHelper.checkSystemScope(req).then((isSystemScope) => {
        if (!isSystemScope) {
          return res.status(201).send({ success: false, msg: "Permission denied." });
        }   

        let search = {
          _id: req.params.id,
        };

        ApiAccountModel.findOne(search).select("-password").then(apiAccount => {
          if (apiAccount === null) {
            return res.status(201).send({ success: false, msg: "Couldn't block. Api Account not found." });
          }

          apiAccount.blocked = true;

          apiAccount.save().then(apiAccountUpdated => {
            return res.status(201).send({ success: true, data: apiAccountUpdated, msg: "Api Account blocked successfully." });
          });
        });
      });
    } catch (err) {
      console.log(err);
      return res.status(500).send({ success: false, msg: "Couldn't block the Api Account." });
    }
  },

  unblock: (req, res) => {
    try {
      ApiHelper.checkSystemScope(req).then((isSystemScope) => {
        if (!isSystemScope) {
          return res.status(201).send({ success: false, msg: "Permission denied." });
        }   

        let search = {
          _id: req.params.id,
        };

        ApiAccountModel.findOne(search).select("-password").then(apiAccount => {
          if (apiAccount === null) {
            return res.status(201).send({ success: false, msg: "Couldn't unblock. Api Account not found." });
          }

          apiAccount.blocked = false;

          apiAccount.save().then(apiAccountUpdated => {
            return res.status(201).send({ success: true, data: apiAccountUpdated, msg: "Api Account unblocked successfully." });
          });
        });
      });
    } catch (err) {
      console.log(err);
      return res.status(500).send({ success: false, msg: "Couldn't unblock the Api Account." });
    }
  },

  remove: (req, res) => {
    try {
      ApiHelper.checkSystemScope(req).then(async (isSystemScope) => {
        if (!isSystemScope) {
          return res.status(201).send({ success: false, msg: "Permission denied." });
        }

        let search = {
          _id: req.params.id,
        };

        let apiAccount = await ApiAccountModel.findOne(search);

        if (apiAccount === null) {
          return res.status(201).send({ success: false, msg: "Couldn't remove the Api Account. User not found." });
        }

        ApiAccountModel.deleteOne(search).then(async (success) => {
          if (success === null || !success.ok) {
            return res.status(201).send({ success: false, msg: "Couldn't remove the Api Account." });
          }

          let search = {
            username: apiAccount.username
          };

          await ApiRefreshTokenModel.remove(search);
          await ApiAccessHistoryModel.remove(search);

          return res.status(201).send({ success: true, msg: "Api Account removed successfully." });
        });
      });
    } catch (err) {
      console.log(err);
      return res.status(500).send({ success: false, msg: "Couldn't remove the Api Account." });
    }
  }
}

module.exports = ApiAccountController;
