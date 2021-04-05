/**
 * TIFX Technologies
 * Copyright (c) 2014-2021 - All rights reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Written by Bruno B. Stein <bruno.stein@tifx.com.br>, 2021
 */

const express = require('express');
const passport = require('passport');
const router = express.Router();
const ApiAccountController = require("../../../controllers/api_account");
require('../../../config/passport')(passport);

router.get('/get', passport.authenticate('jwt', { session: false }), ApiAccountController.getAll);
router.get('/get/:id', passport.authenticate('jwt', { session: false }), ApiAccountController.getId);
router.post('/signup', passport.authenticate('jwt', { session: false }), ApiAccountController.signUp);
router.post('/signin', ApiAccountController.signIn);
router.post('/refresh-token', ApiAccountController.refreshToken);
router.post('/refresh-token/revoke', passport.authenticate('jwt', { session: false }), ApiAccountController.refreshTokenRevoke);
router.put('/update/:id', passport.authenticate('jwt', { session: false }), ApiAccountController.update);
router.get('/block/:id', passport.authenticate('jwt', { session: false }), ApiAccountController.block);
router.get('/unblock/:id', passport.authenticate('jwt', { session: false }), ApiAccountController.unblock);
router.delete('/delete/:id', passport.authenticate('jwt', { session: false }), ApiAccountController.remove);

module.exports = router;