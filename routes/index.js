var express = require('express');
var router = express.Router();

const catwayRoute = require('../routes/catways');

router.get('/', async (req, res) => {
  res.status(200).json({
    name : process.env.APP_NAME,
    version : '1.0',
    status : 200,
    message : 'Bienvenue'
  });
});

router.use('/catways', catwayRoute);

module.exports = router;
