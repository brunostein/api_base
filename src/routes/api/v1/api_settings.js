/**
 * TIFX Technologies
 * Copyright (c) 2014-2021 - All rights reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Written by Bruno B. Stein <bruno.stein@tifx.com.br>, 2021
 */

const express = require('express');
const passport = require('passport');
const router = express.Router();
const ApiSettingsController = require("../../../controllers/api_settings");
require('../../../config/passport')(passport);

/**
 * @swagger
 * /settings/get:
 *   get:
 *     summary: Get Api Settings
 *     tags:
 *       - Api Settings
 *     responses:
 *       201:
 *         description: Return Api Settings
 *         content:
 *           application/json:
 *             scheme:
 *               type: object
*/
router.get('/get', passport.authenticate('jwt', { session: false }), ApiSettingsController.get);

/**
 * @swagger
 * /settings/update:
 *   put:
 *     summary: Update Api Settings
 *     tags:
 *       - Api Settings
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               companyName:
 *                 type: string
 *                 description: The API Company Name.
 *                 required: false
 *               companyWebsite:
 *                 type: string
 *                 description: The API Company Website.
 *                 required: false
 *               companySupportEmail:
 *                 type: string
 *                 description: The API Company Support Email.
 *                 required: false
 *               name:
 *                 type: string
 *                 description: The API Name.
 *                 required: false
 *               descr:
 *                 type: string
 *                 description: The API Description.
 *                 required: false
 *               tokenAuthScheme:
 *                 type: string
 *                 description: The API Token Auth Scheme.
 *                 required: false
 *                 example: JWT|Bearer
 *               accessTokenSecret:
 *                 type: string
 *                 description: The API Access Token Secret.
 *                 required: false
 *               accessTokenExpiresIn:
 *                 type: string
 *                 description: The API Access Token Expires In.
 *                 required: false
 *                 example: 1m|1h|1d|1y
 *               refreshTokenEnabled:
 *                 type: string
 *                 description: The API Refresh Token Enabled.
 *                 required: false
 *                 example: on|off
 *               refreshTokenSecret:
 *                 type: string
 *                 description: The API Refresh Token Secret.
 *                 required: false
 *               refreshTokenExpiresIn:
 *                 type: string
 *                 description: The API RefreshToken Expires In.
 *                 required: false
 *                 example: 1m|1h|1d|1y
 *               storeAccessesHistoryEnabled:
 *                 type: string
 *                 description: The API Store History Enabled.
 *                 required: false
 *                 example: on|off
 *               swaggerHost:
 *                 type: string
 *                 description: The API Swagger Host.
 *                 required: false
 *               swaggerPort:
 *                 type: string
 *                 description: The API Swagger Port.
 *                 required: false
 *               swaggerPath:
 *                 type: string
 *                 description: The API Swagger Path.
 *                 required: false
 *                 example: /doc
 *     responses:
 *       201:
 *         description: Return Api Account created
 *         content:
 *           application/json:
 *             scheme:
 *               type: object
*/
router.put('/update', passport.authenticate('jwt', { session: false }), ApiSettingsController.update);

module.exports = router;