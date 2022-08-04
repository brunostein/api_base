/**
 * TIFX Technologies
 * Copyright (c) 2014-2021 - All rights reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Written by Bruno B. Stein <bruno.stein@tifx.com.br>, 2021
 */

const mongoose = require('mongoose');

const ApiDBConnection = (uri, options={}, callback) => {
  mongoose.connect(uri, options);

  let db = mongoose.connection;

  db.on('error', function (err) {
    consoleLog('MONGODB: Failed to connect to database');
  });

  db.once('open', function () {
    callback();
  });
};

module.exports = ApiDBConnection;
