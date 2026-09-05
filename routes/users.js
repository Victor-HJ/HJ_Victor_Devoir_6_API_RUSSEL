/**
 * @fileoverview Express router for users
 * @module routes/users
 * @requires controllers/users
 * @requires middlewares/private
 * 
 */


const express = require('express');
const router = express.Router();

const service = require('../controllers/users');

const secure = require('../middlewares/private');

/**
 * Route to get a user by email
 * @name GET /api/users/:email
 */

router.get('/:email', secure.checkJWT, service.getUserByEmail);

/**
 * Route to get all users
 * @name GET /api/users
 */

router.get('/', secure.checkJWT, service.getAllUsers);

router.get('/auth/logout', service.logout);

/**
 * Route to create a user
 * @name POST /api/users
 */

router.post('/', secure.checkJWT, service.createUser);

/** 
 * Route to update a user
 * @name PUT /api/users/:email
 */

router.put('/:email', secure.checkJWT, service.updateUser);

/**
 * Route to delete a user
 * @name DELETE /api/users/:email
 */

router.delete('/:email', secure.checkJWT, service.deleteUser);

router.post('/auth/authenticate', service.authenticate);

module.exports = router;
