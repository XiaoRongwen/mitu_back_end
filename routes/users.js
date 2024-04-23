const express = require('express');
const router = express.Router();
const NodeRSA = require('node-rsa');
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/login', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/register', function(req, res, next) {
  const username = req.body.username;
  const password = req.body.password;
  res.send('respond with a resource');
});
module.exports = router;
