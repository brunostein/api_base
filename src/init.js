/**
 * TIFX Technologies
 * Copyright (c) 2014-2021 - All rights reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Written by Bruno B. Stein <bruno.stein@tifx.com.br>, 2021
 */

const fs = require('fs');
const swaggerUi = require('swagger-ui-express');
const listEndpoints = require('express-list-endpoints');

const config = require('./config');
const install = require('./install');
const initDBConnection = require('./helpers/db');
const ApiSettingsModel = require('./models/api/api_settings.model');
const apiCoreMiddleware = require('./middlewares/core');
const apiHelper = require('./helpers/api');
const ApiCache = require('./helpers/cache');

global.apiSettings = null;
global.consoleLog = apiHelper.consoleLog;

const init = async (app) => {
  /*
   * Rest API Init
  */

  consoleLog(`Starting...`);

  initDBConnection(config.mongodb.uri, config.mongodb.options, 
    async function() {
      try {
        let apiSettings = await ApiSettingsModel.findOne();

        if (apiSettings === null) {
          consoleLog("Api Settings not found!");
          apiSettings = await install();
        }

        if (apiSettings === null) {
          consoleLog("Api Settings not found!");
          process.exit(1);
        }

        if (apiSettings.needReboot && apiSettings.needReboot === true) {
          apiHelper.resetNeedReboot();
        }

        global.apiSettings = apiSettings;
        global.apiCache = new ApiCache();

        // Swagger DOC
        if (apiSettings.swaggerPath !== null) {
          consoleLog("Loading API Documentation...");
          let swaggerSpec = require('./swagger');
          app.use(apiSettings.swaggerPath, swaggerUi.serve, swaggerUi.setup(swaggerSpec));
        }

        // Middlewares
        app.use(apiCoreMiddleware);

        // Load App Customizations
        consoleLog("Loading custom file...");
        let custom = require('./custom');
        custom.load(app);
        
        // Routes
        app.use(require('./routes/web'));
        app.use(require('./routes/api'));

        // catch 404 and forward to error handler
        app.use(function(req, res, next) {
          let errMessage = "Endpoint not found.";

          return res.status(404).send({ success: false, msg: errMessage });
        });

        consoleLog("Creating Routes file...");

        let apiRoutes = listEndpoints(app);
        let data = JSON.stringify(apiRoutes);
        fs.writeFileSync('routes.json', data);

        consoleLog("Started successfully...");
      } catch (err) {
        consoleLog(err);
      }
    }
  );
}

module.exports = init;
