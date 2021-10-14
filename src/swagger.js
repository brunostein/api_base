/**
 * TIFX Technologies
 * Copyright (c) 2014-2021 - All rights reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Written by Bruno B. Stein <bruno.stein@tifx.com.br>, 2021
 */

const swaggerJSDoc = require('swagger-jsdoc');
const config = require('./config');

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: global.apiSettings.name,
    version: config.api.version,
    description: global.apiSettings.descr,
    contact: {
      name: global.apiSettings.companyName,
      url: global.apiSettings.companyWebsite,
      email: global.apiSettings.companySupportEmail
    }
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "apiKey",
        name: "Authorization",
        scheme: "bearer",
        "bearerFormat": "JWT",
        in: "header"
      }
    }
  },
  security: [
    {
      bearerAuth: []
    }
  ],
  servers: [
    {
      url: `${global.apiSettings.swaggerHost}:${global.apiSettings.swaggerPort}/api/v1`,
      description: global.apiSettings.name,
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: ['./routes/api/v1/*.js'],
}

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
