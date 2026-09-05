/**
 * @fileoverview Express router for reservations
 * @module routes/reservations
 * @requires controllers/catways
 * @requires controllers/reservations
 * @requires middlewares/private
 */


const express = require('express');
const router = express.Router();

const service = require('../controllers/reservations');

const secure = require('../middlewares/private');

/**
 * Route to get all reservations
 * @name GET /api/reservations
 */

router.get('/', secure.checkJWT, service.getAllReservations);

/**
 * Route to get all reservations for one catway
 * @name GET /api/catways/:id/reservations
 */

router.get('/:id/reservations', secure.checkJWT, service.getReservationsByCatway);

/**
 * Route to get a reservation
 * @name GET /api/catways/:id/reservations/:idReservation
 */

router.get('/:id/reservations/:idReservation', secure.checkJWT, service.getReservationById);

/**
 * Route to create a reservation
 * @name POST /api/catways/:id/reservations
 */

router.post('/:id/reservations', secure.checkJWT, service.createReservation);

/**
 * Route to update a reservation
 * @name PUT /api/catways/:id/reservations/:idReservation
 */

router.put('/:id/reservations/:idReservation', secure.checkJWT, service.updateReservation);

/**
 * Route to delete a reservation
 * @name DELETE /api/catways/:id/reservations/:idReservation
 */

router.delete('/:id/reservations/:idReservation', secure.checkJWT, service.deleteReservation);

module.exports = router;