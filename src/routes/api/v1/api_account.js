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
 * /accounts/signin:
 *   post:
 *     summary: Authenticate API Account.
 *     tags:
 *       - Api Accounts
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
 *                 required: true
 *               password:
 *                 type: string
 *                 description: The API Account password.
 *                 example: api_account_username_password
 *                 required: true
 *     responses:
 *       201:
 *         description: Return authorization access_token
 *         content:
 *           application/json:
 *             scheme:
 *               type: object
*/
router.post('/signin', ApiAccountController.signIn);

/**
 * @swagger
 * /accounts/get:
 *   get:
 *     summary: Retrieve a list of API Accounts
 *     description: Retrieve a list of API Accounts.
 *     tags:
 *       - Api Accounts
 *     responses:
 *       201:
 *         description: Return the API Accounts list
 *         content:
 *           application/json:
 *             scheme:
 *               type: array
*/
router.get('/get', passport.authenticate('jwt', { session: false }), ApiAccountController.getAll);

/**
 * @swagger
 * /accounts/get/{accountId}:
 *   get:
 *     summary: Get API Account by ID
 *     tags:
 *       - Api Accounts
 *     parameters:
 *       - in: path
 *         name: accountId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of API Account
 *     responses:
 *       201:
 *         description: Return API Account by ID
 *         content:
 *           application/json:
 *             scheme:
 *               type: object
*/
router.get('/get/:id', passport.authenticate('jwt', { session: false }), ApiAccountController.getId);

/**
 * @swagger
 * /accounts/signup:
 *   post:
 *     summary: Create API Account.
 *     tags:
 *       - Api Accounts
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The API Account email.
 *                 required: true
 *               username:
 *                 type: string
 *                 description: The API Account username.
 *                 required: true
 *               password:
 *                 type: string
 *                 description: The API Account password.
 *                 required: true
 *               scope:
 *                 type: string
 *                 description: The API Account scope.
 *                 example: user|system
 *                 required: true
 *     responses:
 *       201:
 *         description: Return Api Account created
 *         content:
 *           application/json:
 *             scheme:
 *               type: object
*/
router.post('/signup', passport.authenticate('jwt', { session: false }), ApiAccountController.signUp);

/**
 * @swagger
 * /accounts/refresh-token:
 *   post:
 *     summary: Refresh the API Account access_token.
 *     tags:
 *       - Api Accounts
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
 *                 required: true
 *               refresh_token:
 *                 type: string
 *                 description: The API Account refresh_token.
 *                 required: true
 *     responses:
 *       201:
 *         description: Return the new Api Account access_token
 *         content:
 *           application/json:
 *             scheme:
 *               type: object
*/
router.post('/refresh-token', ApiAccountController.refreshToken);

/**
 * @swagger
 * /accounts/refresh-token/revoke:
 *   post:
 *     summary: Revoke the the API Account refresh_token.
 *     tags:
 *       - Api Accounts
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
 *                 required: true
 *               refresh_token:
 *                 type: string
 *                 description: The API Account refresh_token.
 *                 required: true
 *     responses:
 *       201:
 *         description: Return true|false
 *         content:
 *           application/json:
 *             scheme:
 *               type: object
*/
router.post('/refresh-token/revoke', passport.authenticate('jwt', { session: false }), ApiAccountController.refreshTokenRevoke);

/**
 * @swagger
 * /accounts/update/{accountId}:
 *   put:
 *     summary: Update API Account.
 *     tags:
 *       - Api Accounts
 *     parameters:
 *       - in: path
 *         name: accountId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of API Account
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The API Account email.
 *                 required: false
 *               username:
 *                 type: string
 *                 description: The API Account username.
 *                 required: false
 *               password:
 *                 type: string
 *                 description: The API Account password.
 *                 required: false
 *               scope:
 *                 type: string
 *                 description: The API Account scope.
 *                 example: user|system
 *                 required: false
 *               blocked:
 *                 type: string
 *                 description: true|false to block the API Account.
 *                 required: false
 *     responses:
 *       201:
 *         description: Return Api Account created
 *         content:
 *           application/json:
 *             scheme:
 *               type: object
*/
router.put('/update/:id', passport.authenticate('jwt', { session: false }), ApiAccountController.update);

/**
 * @swagger
 * /accounts/block/{accountId}:
 *   get:
 *     summary: Block the API Account by ID
 *     tags:
 *       - Api Accounts
 *     parameters:
 *       - in: path
 *         name: accountId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of API Account
 *     responses:
 *       201:
 *         description: Return success true|false
 *         content:
 *           application/json:
 *             scheme:
 *               type: object
*/
router.get('/block/:id', passport.authenticate('jwt', { session: false }), ApiAccountController.block);

/**
 * @swagger
 * /accounts/unblock/{accountId}:
 *   get:
 *     summary: Unblock the API Account by ID
 *     tags:
 *       - Api Accounts
 *     parameters:
 *       - in: path
 *         name: accountId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of API Account
 *     responses:
 *       201:
 *         description: Return success true|false
 *         content:
 *           application/json:
 *             scheme:
 *               type: object
*/
router.get('/unblock/:id', passport.authenticate('jwt', { session: false }), ApiAccountController.unblock);

/**
 * @swagger
 * /accounts/delete/{accountId}:
 *   delete:
 *     summary: Delete the API Account by ID
 *     tags:
 *       - Api Accounts
 *     parameters:
 *       - in: path
 *         name: accountId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of API Account
 *     responses:
 *       201:
 *         description: Return success true|false
 *         content:
 *           application/json:
 *             scheme:
 *               type: object
*/
router.delete('/delete/:id', passport.authenticate('jwt', { session: false }), ApiAccountController.remove);

module.exports = router;