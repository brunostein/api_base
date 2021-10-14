/**
 * TIFX Technologies
 * Copyright (c) 2014-2021 - All rights reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Written by Bruno B. Stein <bruno.stein@tifx.com.br>, 2021
 */

const express = require('express');
const passport = require('passport');
const router = express.Router();
const ApiLogController = require("../../../controllers/api_log");
require('../../../config/passport')(passport);

/**
 * @swagger
 * /logs/get-lines:
 *   get:
 *     summary: Get Access Log Lines
 *     tags:
 *       - Api Logs
 *     parameters:
 *       - in: query
 *         name: lines
 *         schema:
 *           type: integer
 *         required: false
 *         description: Total lines
 *       - in: query
 *         name: filters
 *         schema:
 *           type: string
 *         required: false
 *         description: String to filter lines
 *     responses:
 *       201:
 *         description: Return Access Log Lines
 *         content:
 *           application/json:
 *             scheme:
 *               type: array
*/
router.get('/get-lines', passport.authenticate('jwt', { session: false }), ApiLogController.getLogLines);

module.exports = router;
