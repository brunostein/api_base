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

router.get('/ping', passport.authenticate('jwt', { session: false }), ApiUtilController.ping);

module.exports = router;
