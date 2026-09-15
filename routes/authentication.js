/**
 * @fileoverview Express router for authentication routes
 * @module routes/authentication
 * @requires controllers/authentication
 */

const express = require('express');
const router = express.Router();

const service = require('../controllers/authentication');

/**
 * Route to logout from the API
 * @name GET api/authentication/logout
 */
router.get('/logout', service.logout);

/**
 * Route to login to the API
 * @name POST api/authentication/login
 */

router.post('/login', service.login);

module.exports = router;
