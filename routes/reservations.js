const express = require('express');
const router = express.Router();

const service = require('../controllers/reservations');

const private = require('../middlewares/private');

router.get('/', private.checkJWT, service.getAllReservations);

router.get('/:id/reservations', private.checkJWT, service.getReservationsByCatway);

router.get('/:id/reservations/:idReservation', private.checkJWT, service.getReservationById);

router.post('/:id/reservations', private.checkJWT, service.createReservation);

router.put('/:id/reservations/:idReservation', private.checkJWT, service.updateReservation);

router.delete('/:id/reservations/:idReservation', private.checkJWT, service.deleteReservation);

module.exports = router;