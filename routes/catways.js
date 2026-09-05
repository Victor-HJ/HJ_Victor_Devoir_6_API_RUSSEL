/**
 * @fileoverview Express router for catways
 * @module routes/catways
 * @requires controllers/catways
 * @requires middlewares/private
 */

const express = require('express');
const router = express.Router();

const service = require('../controllers/catways');

const secure = require('../middlewares/private');

/**
 * Route to get a catway by its number
 * @name GET /api/catways/:id
 */

router.get('/:id', secure.checkJWT, service.getCatwayById);

/**
 * Route to get all catways
 * @name GET /api/catways
 */

router.get('/', secure.checkJWT, service.getAllCatways);

/**
 * Route to create a catway
 * @name POST /api/catways
 */

router.post('/', secure.checkJWT, service.createCatway);

/**
 * Route to update a catway
 * @name PUT /api/catways/:id
 */

router.put('/:id', secure.checkJWT, service.updateCatway);

/**
 * Route to delete a catway
 * @name DELETE /api/catways/:id
 */

router.delete('/:id', secure.checkJWT, service.deleteCatway);

module.exports = router;