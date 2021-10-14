/**
 * TIFX Technologies
 * Copyright (c) 2014-2021 - All rights reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Written by Bruno B. Stein <bruno.stein@tifx.com.br>, 2021
 */

const express = require('express');
const passport = require('passport');
const router = express.Router();
const ApiInfoController = require("../../../controllers/api_info");
require('../../../config/passport')(passport);

/**
 * @swagger
 * /info/get:
 *   get:
 *     summary: Retrieve Api Info
 *     description: Retrieve API Info.
 *     tags:
 *       - Api Info
 *     responses:
 *       201:
 *         description: Return the API Info
 *         content:
 *           application/json:
 *             scheme:
 *               type: object
*/
router.get('/get', passport.authenticate('jwt', { session: false }), ApiInfoController.getInfo);

module.exports = router;