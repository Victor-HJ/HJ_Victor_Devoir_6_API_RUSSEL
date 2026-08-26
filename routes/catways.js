const express = require('express');
const router = express.Router();

const service = require('../controllers/catways');

router.get('/:id', service.getById);

router.get('/', service.getAll);

router.post('/', service.create);

module.exports = router;