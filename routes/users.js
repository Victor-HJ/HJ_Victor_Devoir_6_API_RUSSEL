const express = require('express');
const router = express.Router();

const service = require('../controllers/users');

const private = require('../middlewares/private');

router.get('/:email', private.checkJWT, service.getUserByEmail);

router.get('/', private.checkJWT, service.getAllUsers);

router.get('/auth/logout', private.checkJWT, service.logout);

router.post('/', private.checkJWT, service.createUser);

router.put('/:email', private.checkJWT, service.updateUser);

router.delete('/:email', private.checkJWT, service.deleteUser);

router.post('/auth/authenticate', private.checkJWT, service.authenticate);

module.exports = router;
