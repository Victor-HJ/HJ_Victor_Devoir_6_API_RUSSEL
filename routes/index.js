var express = require('express');
var router = express.Router();

const catwayRoute = require('../routes/catways');
const userRoute = require('../routes/users');
const reservationRoute = require('../routes/reservations');

router.get('/', async (req, res) => {
  res.status(200).json({
    name : process.env.APP_NAME,
    version : '1.0',
    status : 200,
    message : 'Bienvenue'
  });
});

router.use('/catways', catwayRoute);
router.use('/users', userRoute);
router.use('/reservations', reservationRoute);
router.use('/catways', reservationRoute);

module.exports = router;
