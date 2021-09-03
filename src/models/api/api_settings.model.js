/**
 * TIFX Technologies
 * Copyright (c) 2014-2021 - All rights reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Written by Bruno B. Stein <bruno.stein@tifx.com.br>, 2021
 */

const mongoose = require("mongoose");

const apiSettingsSchema =  {
  port: { type: Number, required: false },
  name: { type: String, required: false },
  descr: { type: String, required: false },
  tokenAuthScheme: { type: String, required: false },
  accessTokenSecret: { type: String, required: true },
  accessTokenExpiresIn: { type: String, required: true },
  refreshTokenEnabled: { type: String, required: true, default: "off" },
  refreshTokenSecret: { type: String, required: true },
  refreshTokenExpiresIn: { type: String, default: null }
};

const ApiSettingsSchema = new mongoose.Schema(
  apiSettingsSchema, 
  {timestamps: true}
);

module.exports = mongoose.model("Settings", ApiSettingsSchema);
