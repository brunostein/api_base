/**
 * TIFX Technologies
 * Copyright (c) 2014-2021 - All rights reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Written by Bruno B. Stein <bruno.stein@tifx.com.br>, 2021
 */

const express = require('express');
const passport = require('passport');
const router = express.Router();
const ApiUtilController = require("../../../controllers/api_util");
require('../../../config/passport')(passport);

/**
 * @swagger
 * /utils/ping:
 *   get:
 *     summary: Ping API
 *     tags:
 *       - Api Utils
 *     responses:
 *       201:
 *         description: Return Api Pong
 *         content:
 *           application/json:
 *             scheme:
 *               type: object
*/
router.get('/ping', passport.authenticate('jwt', { session: false }), ApiUtilController.ping);

/**
 * @swagger
 * /utils/shutdown:
 *   get:
 *     summary: Shutdown API
 *     tags:
 *       - Api Utils
 *     responses:
 *       201:
 *         description: Return true|false
 *         content:
 *           application/json:
 *             scheme:
 *               type: object
*/
router.get('/shutdown', passport.authenticate('jwt', { session: false }), ApiUtilController.shutdown);

/**
 * @swagger
 * /utils/reboot:
 *   get:
 *     summary: Reboot API
 *     tags:
 *       - Api Utils
 *     responses:
 *       201:
 *         description: Return true|false
 *         content:
 *           application/json:
 *             scheme:
 *               type: object
*/
router.get('/reboot', passport.authenticate('jwt', { session: false }), ApiUtilController.reboot);

module.exports = router;
