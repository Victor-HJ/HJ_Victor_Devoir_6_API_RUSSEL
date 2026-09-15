var express = require('express');
var router = express.Router();

const catwayRoute = require('../routes/catways');
const userRoute = require('../routes/users');
const reservationRoute = require('../routes/reservations');
const connectionRoute = require('../routes/authentication');
const secure = require('../middlewares/private');

router.get('/', (req, res) => {
  res.render('index');
});
router.get('/dashboardView', secure.checkJWT, (req,res) => {
    res.render('dashboardView');
});
router.get('/catwaysView', secure.checkJWT, (req, res) => {
  res.render('catwaysView')
});

router.use('/catways', catwayRoute);
router.use('/users', userRoute);
router.use('/reservations', reservationRoute);
router.use('/catways', reservationRoute);
router.use('/authentication', connectionRoute);

module.exports = router;
