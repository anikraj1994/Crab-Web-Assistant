var express = require('express');
var router = express.Router();
var request = require("request");


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/register', function(req, res, next) {
 
var options = { method: 'POST',
  url: 'https://directline.botframework.com/v3/directline/conversations',
  headers: 
   { 'cache-control': 'no-cache',
     authorization: 'Bearer WcFG7BU0RCE.cwA.1uk.8bNNt3eyMp_lhDSy2T1EffLLR7kjv4lRkT5YCOZsTKE' } };

request(options, function (error, response, body) {
  // console.log(body);  
  if (error){
console.log(error);
res.send("error");  
  } 
  else {
    res.json(JSON.parse(body));
    // console.log(body.conversationId);
  }
  
});



});

router.get('/getSocketLink', function(req, res, next) {

var options = { method: 'GET',
  url: 'https://directline.botframework.com/v3/directline/conversations/'+req.query.conversationId,
  headers: 
   { 
     'cache-control': 'no-cache',
     authorization: 'Bearer WcFG7BU0RCE.cwA.1uk.8bNNt3eyMp_lhDSy2T1EffLLR7kjv4lRkT5YCOZsTKE' } };

request(options, function (error, response, body) {
 if (error){
 console.log(error);
 res.send("error");
 }
  else {
    res.json(JSON.parse(body));
    // console.log(body.conversationId);
  }
});

});

router.get('/send', function(req, res, next) {
  console.log("sending "+req.query.message);
var options = { method: 'POST',
  url: 'https://directline.botframework.com/v3/directline/conversations/'+req.query.conversationId+'/activities',
  headers: 
   { 
     'cache-control': 'no-cache',
     'content-type': 'application/json',
     authorization: 'Bearer WcFG7BU0RCE.cwA.1uk.8bNNt3eyMp_lhDSy2T1EffLLR7kjv4lRkT5YCOZsTKE' },
  body: { type: 'message', from: { id: 'user1' }, text: req.query.message },
  json: true };

request(options, function (error, response, body) {
  if (error) {
    console.log(error);
    res.send("error");
  }
  else {
    res.send("ok");
  }
});
});

module.exports = router;
