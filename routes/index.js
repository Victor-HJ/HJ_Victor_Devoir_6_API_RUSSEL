var express = require('express');
var router = express.Router();

const catwayRoute = require('../routes/catways');
const userRoute = require('../routes/users');
const reservationRoute = require('../routes/reservations');
const connectionRoute = require('../routes/authentication');
const secure = require('../middlewares/private');
const Reservation = require('../models/reservation');

router.get('/', (req, res) => {
  res.render('index_view');
});

router.get('/dashboard_view', secure.checkJWT, async (req,res) => {

  try {

    const connectedUser = req.user;

    const dateNow = new Date().toLocaleString('fr-FR', {
      day : '2-digit',
      month : '2-digit',
      year : 'numeric',
      hour : '2-digit',
      minute : '2-digit'
    });

    res.render('dashboard_view', {
      user : connectedUser,
      currentDate : dateNow,
    });

  } catch {

    res.status(500).json("Erreur lors de l'affichage du tableau de bord");

  }
});

router.get('/catways_view', secure.checkJWT, async (req, res) => {
  res.render('catways_view')
});

router.get('/users_view', secure.checkJWT, async (req, res) => {
  res.render('users_view')
});

router.get('/reservations_view', secure.checkJWT, async (req, res) => {
  res.render('reservations_view')
});

router.use('/catways', catwayRoute);
router.use('/users', userRoute);
router.use('/reservations', reservationRoute);
router.use('/catways', reservationRoute);
router.use('/authentication', connectionRoute);

module.exports = router;
