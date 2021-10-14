/**
 * TIFX Technologies
 * Copyright (c) 2014-2021 - All rights reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Written by Bruno B. Stein <bruno.stein@tifx.com.br>, 2021
 */

const mongoose = require("mongoose");

const apiRefreshTokesSchema =  {
  username: { type: String, required: true },
  refresh_token: { type: String, required: true },
  revoked: { type: Boolean, default: false },
  revoked_at: { type: Date, default: null },
  revoked_by_username: { type: String, default: null },
  refresh_stats: {
    total_attempts: { type: Number, default: 0 },
    total_success: { type: Number, default: 0 },
    total_failed: { type: Number, default: 0 },
    last: { type: Date }
  }
};

const ApiRefreshTokensSchema = new mongoose.Schema(
  apiRefreshTokesSchema, 
  {timestamps: true}
);

module.exports = mongoose.model("api_accounts_refresh_tokens", ApiRefreshTokensSchema);
