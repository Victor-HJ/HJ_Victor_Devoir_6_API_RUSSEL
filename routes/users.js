const express = require('express');
const router = express.Router();

const service = require('../controllers/users');

router.get('/:email', service.getUserByEmail);

router.get('/', service.getAllUsers);

router.post('/', service.createUser);

router.put('/:email', service.updateUser);

router.delete('/:email', service.deleteUser);

module.exports = router;
