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
  blocked: { type: Boolean, default: false },
  system: { type: Boolean, default: false },
  auth_stats: {
    total_attempts: { type: Number, default: 0 },
    total_success: { type: Number, default: 0 },
    total_failed: { type: Number, default: 0 },
    last: { type: Date }
  }
};

const ApiAccountSchema = new mongoose.Schema(
  apiAccountSchema, 
  {timestamps: true}
);

ApiAccountSchema.index({username: 1});
ApiAccountSchema.index({username: 1, password: 1});

module.exports = mongoose.model("api_accounts", ApiAccountSchema);
