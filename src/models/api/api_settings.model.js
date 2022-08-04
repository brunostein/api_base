/**
 * TIFX Technologies
 * Copyright (c) 2014-2021 - All rights reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Written by Bruno B. Stein <bruno.stein@tifx.com.br>, 2021
 */

const mongoose = require("mongoose");

const ApiSettingsSchema = new mongoose.Schema({
  companyName: { type: String, required: false },
  companyWebsite: { type: String, required: false },
  companySupportEmail: { type: String, required: false },
  name: { type: String, required: false },
  descr: { type: String, required: false },
  tokenAuthScheme: { type: String, required: false },
  accessTokenSecret: { type: String, required: true },
  accessTokenExpiresIn: { type: String, required: true },
  refreshTokenEnabled: { type: String, required: true, default: "off" },
  refreshTokenSecret: { type: String, required: true },
  refreshTokenExpiresIn: { type: String, default: null },
  storeAccessesHistoryEnabled: { type: String, required: true, default: "off" },
  needReboot: { type: Boolean, default: false },
  swaggerHost: { type: String, default: null },
  swaggerPort: { type: String, default: null },
  swaggerPath: { type: String, default: null },
  cache: {
    enabled: { type: Boolean, default: false },
    prefix: { type: String, default: '__rest_api_base__' },
    type: { type: String },
    redis: {
      host: { type: String },
      port: { type: Number },
      pass: { type: String },
      defaultExpirationTime: { type: Number },
      randomExpiration: { type: Boolean, default: true },
      randomExpirationMinNumber: { type: Number, default: 60 },
      randomExpirationMaxNumber: { type: Number, default: 600 },
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("api_settings", ApiSettingsSchema);
