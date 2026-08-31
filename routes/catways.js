const express = require('express');
const router = express.Router();

const service = require('../controllers/catways');

router.get('/:id', service.getCatwayById);

router.get('/', service.getAllCatways);

router.post('/', service.createCatway);

router.put('/:id', service.updateCatway);

router.delete('/:id', service.deleteCatway);

module.exports = router;