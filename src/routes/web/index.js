/**
 * TIFX Technologies
 * Copyright (c) 2014-2021 - All rights reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Written by Bruno B. Stein <bruno.stein@tifx.com.br>, 2021
 */

const express = require('express');
const router = express.Router();
const config = require('../../config');

/* GET home page. */
router.get('/', function(req, res, next) {
  let data = {
    title: global.apiSettings.name,
    descr: global.apiSettings.descr,
  }
  res.render('index', data);
});

module.exports = router;
