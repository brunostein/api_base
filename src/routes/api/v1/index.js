/**
 * TIFX Technologies
 * Copyright (c) 2014-2021 - All rights reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Written by Bruno B. Stein <bruno.stein@tifx.com.br>, 2021
 */

const express = require('express');
const router = express.Router();

router.use('/info', require('./api_info'));
router.use('/accounts', require('./api_account'));
router.use('/settings', require('./api_settings'));

module.exports = router;
