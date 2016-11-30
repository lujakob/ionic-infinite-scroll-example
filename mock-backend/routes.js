var express = require('express'),
    actions = require('./methods');

var router = express.Router();

router.get('/clients', actions.getClients);

module.exports = router;