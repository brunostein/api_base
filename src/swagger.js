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
      name: 'TIFX Technologies',
      url: 'https://www.tifx.com.br',
      email: 'contato@tifx.com.br'
    },
    license: {
      name: "Apache 2.0",
      url: "https://www.apache.org/licenses/LICENSE-2.0.html"
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        name: "Authorization",
        scheme: "bearer",
        bearerFormat: "JWT",
        in: "header"
      }
    }
  },
  servers: [
    {
      url: `http://${config.swagger.host}:${config.swagger.port}/api/v1`,
      description: 'Development server',
    },
  ],
};

const options = {
  swaggerDefinition,
  // Path to the API docs
  apis: ['./routes/api/v1/*.js'],
}

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
