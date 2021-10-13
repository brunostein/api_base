/**
 * TIFX Technologies
 * Copyright (c) 2014-2021 - All rights reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Written by Bruno B. Stein <bruno.stein@tifx.com.br>, 2021
 */

const createError = require('http-errors');
const http = require('http');
const https = require('https');
const express = require('express');
const fs = require('fs');
const path = require('path');
const morganLogger = require('morgan');
const rfs = require('rotating-file-stream');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const apiHelper = require('./helpers/api');
const initMongoDBConnection = require('./helpers/db_conn');
const config = require("./config");
const install = require("./install");
const app = express();

global.apiSettings = null;

initMongoDBConnection(config.mongodb.uri, config.mongodb.options, function() {

  // Check Api Settings before start it
  apiHelper.getApiSettings().then(async (apiSettings) => {
    if (apiSettings === null) {
      console.log("Api Settings not found!");
      apiSettings = await install();
    }

    if (apiSettings === null) {
      console.log("Api Settings not found!");
      process.exit(1);
    }

    global.apiSettings = apiSettings;

    // Load App Customizations
    const custom = require("./custom");
    custom.load(app);

    // Swagger DOC
    const swaggerSpec = require('./swagger');
    app.use('/doc', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

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

    app.use(apiHelper.apiMiddleware);
    app.use(require('./routes/api'));
    app.use(require('./routes/web'));

    // catch 404 and forward to error handler
    app.use(function(req, res, next) {
      let errMessage = "Endpoint not found.";
      if (req.originalUrl.match("/api/")) {
        return res.status(404).send({ success: false, msg: errMessage });
      }
      next(createError(404, errMessage));
    });

    // error handler
    app.use(function(err, req, res, next) {
      // set locals, only providing error in development
      res.locals.message = err.message;
      res.locals.error = req.app.get('env') === 'development' ? err : {};

      console.log(err);

      // render the error page
      res.status(err.status || 500);
      res.render('error');
    });

    let server = http.createServer(app);

    if (config.api.ssl.enabled === "on") {
      let privateKey  = fs.readFileSync(config.api.ssl.key, 'utf8');
      let certificate = fs.readFileSync(config.api.ssl.cert, 'utf8');

      let credentials = { key: privateKey, cert: certificate };
      server = https.createServer(credentials, app);
    }

    server.listen(config.api.port, config.api.host, () => {
      console.log(`Started up at http://${config.api.host}:${config.api.port}`);
    });
  });
});

module.exports = app;
