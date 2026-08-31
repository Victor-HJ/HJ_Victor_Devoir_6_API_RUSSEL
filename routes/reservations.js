const express = require('express');
const router = express.Router();

const service = require('../controllers/reservations');

router.get('/', service.getAllReservations);

router.get('/:id/reservations', service.getReservationsByCatway);

router.get('/:id/reservations/:idReservation', service.getReservationById);

router.post('/:id/reservations', service.createReservation);

router.put('/:id/reservations/:idReservation', service.updateReservation);

router.delete('/:id/reservations/:idReservation', service.deleteReservation);

module.exports = router;