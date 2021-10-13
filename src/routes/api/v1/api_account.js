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

/**
 * @swagger
 * /accounts/get:
 *   get:
 *     summary: Retrieve a list of API Accounts
 *     description: Retrieve a list of API Accounts.
 *     parameters:
 *       - 
 *         name: authorization
 *         in: header
 *         description: an authorization header
 *         required: true
 *         type: string
 *     security:
 *       - Bearer: []
 *     responses:
 *       200:
 *         description: Return the API Accounts list
 *         content:
 *           application/json:
 *              scheme:
 *                type: array
*/
router.get('/get', passport.authenticate('jwt', { session: false }), ApiAccountController.getAll);
router.get('/get/:id', passport.authenticate('jwt', { session: false }), ApiAccountController.getId);
router.post('/signup', passport.authenticate('jwt', { session: false }), ApiAccountController.signUp);

/**
 * @swagger
 * /accounts/signin:
 *   post:
 *     summary: Create a JSONPlaceholder user.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: The API Account username.
 *                 example: api_account_username
 *               password:
 *                 type: string
 *                 description: The API Account password.
 *                 example: api_account_username_password
 *     responses:
 *       200:
 *         description: Return access_token and refresh_token for authentication
 *         content:
 *           application/json:
 *              scheme:
 *                type: object
*/
router.post('/signin', ApiAccountController.signIn);
router.post('/refresh-token', ApiAccountController.refreshToken);
router.post('/refresh-token/revoke', passport.authenticate('jwt', { session: false }), ApiAccountController.refreshTokenRevoke);
router.put('/update/:id', passport.authenticate('jwt', { session: false }), ApiAccountController.update);
router.get('/block/:id', passport.authenticate('jwt', { session: false }), ApiAccountController.block);
router.get('/unblock/:id', passport.authenticate('jwt', { session: false }), ApiAccountController.unblock);
router.delete('/delete/:id', passport.authenticate('jwt', { session: false }), ApiAccountController.remove);

module.exports = router;