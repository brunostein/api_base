/**
 * TIFX Technologies
 * Copyright (c) 2014-2021 - All rights reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Written by Bruno B. Stein <bruno.stein@tifx.com.br>, 2021
 */

const rootPath = require('app-root-path');
require('dotenv').config({ 'path': rootPath + "/.env" });

var config = {
  rootPath: rootPath,
  api: {
    name: "Api Base",
    version: "1.0.1",
    host: process.env.API_HOST || '0.0.0.0',
    port: process.env.API_PORT || 5000,
    ssl: {
      enabled: process.env.API_SSL_ENABLED || 'off',
      key: process.env.API_SSL_KEY_PATH,
      cert: process.env.API_SSL_CERT_PATH
    }
  },
  mongodb: {
    uri: process.env.MONGODB_URI,
    options: {
      useCreateIndex: true,
      useNewUrlParser: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
      auto_reconnect: true,
      connectTimeoutMS: 30000,
      keepAlive: 1
    }
  }
};

module.exports = config;
