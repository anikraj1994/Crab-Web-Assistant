var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  if(req.query.message)res.send("Hello, "+req.query.message);
  else res.send("What?");
});

module.exports = router;
