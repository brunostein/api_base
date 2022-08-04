/**
 * TIFX Technologies
 * Copyright (c) 2014-2021 - All rights reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Written by Bruno B. Stein <bruno.stein@tifx.com.br>, 2021
 */

const mongoose = require("mongoose");

const ApiAccessesHistorySchema = new mongoose.Schema({
  username: { type: String, required: false },
  api_endpoint: { type: String, required: false },
  ipaddress: { type: String, required: false }
}, {
  timestamps: true
});

module.exports = mongoose.model("api_acesses_history", ApiAccessesHistorySchema);
