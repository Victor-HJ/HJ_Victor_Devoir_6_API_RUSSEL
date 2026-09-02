const express = require('express');
const router = express.Router();

const service = require('../controllers/catways');

const private = require('../middlewares/private');

router.get('/:id', private.checkJWT, service.getCatwayById);

router.get('/', private.checkJWT, service.getAllCatways);

router.post('/', private.checkJWT, service.createCatway);

router.put('/:id', private.checkJWT, service.updateCatway);

router.delete('/:id', private.checkJWT, service.deleteCatway);

module.exports = router;