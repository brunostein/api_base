/**
 * TIFX Technologies
 * Copyright (c) 2014-2021 - All rights reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Written by Bruno B. Stein <bruno.stein@tifx.com.br>, 2021
 */

const mongoose = require("mongoose");

const apiAccountSchema =  {
  email: { type: String, required: false, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  scope: { type: String, required: true },
  refresh_token: { type: String, default: null },
  blocked: { type: Boolean, default: 0 }
}

const ApiAccountSchema = new mongoose.Schema(
  apiAccountSchema, 
  {timestamps: true}
);

module.exports = mongoose.model("Account", ApiAccountSchema);