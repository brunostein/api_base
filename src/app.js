/**
 * TIFX Technologies
 * Copyright (c) 2014-2021 - All rights reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Written by Bruno B. Stein <bruno.stein@tifx.com.br>, 2021
 */

const http = require('http');
const https = require('https');
const express = require('express');
const fs = require('fs');
const path = require('path');
const morganLogger = require('morgan');
const rfs = require('rotating-file-stream');
const cors = require('cors');

const config = require("./config");
const init = require("./init");
const app = express();

(() => {
  try {
    // create a rotating write stream
    const accessLogStream = rfs.createStream('access.log', {
      interval: '1d', // rotate daily
      path: path.join(__dirname, 'log')
    });

    // view engine setup
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'pug');

    app.use(cors());

    // Parse application/x-www-form-urlencoded
    app.use(express.urlencoded({ extended: false }));
    // Parse application/json
    app.use(express.json());

    app.use(morganLogger('dev'));
    app.use(morganLogger('combined', { stream: accessLogStream }));
    app.use(express.static(path.join(__dirname, 'public')));

    // Init script
    init(app);

    let server = http.createServer(app);

    if (config.api.ssl.enabled === "on") {
      let privateKey  = fs.readFileSync(config.api.ssl.key, 'utf8');
      let certificate = fs.readFileSync(config.api.ssl.cert, 'utf8');

      let credentials = { key: privateKey, cert: certificate };
      server = https.createServer(credentials, app);
    }

    server.listen(config.api.port, config.api.host, () => {
      consoleLog(`Listen on http://${config.api.host}:${config.api.port}`);
    });
  } catch (err) {
    consoleLog(err);
  }
})();

module.exports = app;
