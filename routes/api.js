'use strict';

let Wit = null;
var express = require('express');
var router = express.Router();
// Wit = require('node-wit').Wit;

var builder = require('botbuilder');
var connector = new builder.ChatConnector({
    appId: "6ac77405-4dbd-46f0-b68e-60030031e004",
    appPassword: "JuCTL4CVh8ZpnAKvnk1XF9K"
});
var bot = new builder.UniversalBot(connector);
var intents = new builder.IntentDialog();

router.post('/bot',connector.listen());

bot.dialog('/', intents);

intents.matches(/^change name/i, [
    function (session) {
        session.beginDialog('/profile');
    },
    function (session, results) {
        session.send('Ok... Changed your name to %s', session.userData.name);
    }
]);

intents.matches(/^what is the time/i, [
    function (session) {
      session.beginDialog('/time');
    }
]);
intents.matches(/^time/i, [
    function (session) {
      session.beginDialog('/time');
    }
]);


intents.onDefault([
    function (session, args, next) {
        if (!session.userData.name) {
            session.beginDialog('/profile');
        } else {
            next();
        }
    },
    function (session, results) {
        session.send('Hello %s!', session.userData.name);
    }
]);

bot.dialog('/profile', [
    function (session) {
        builder.Prompts.text(session, 'Hi! What is your name?');
    },
    function (session, results) {
        session.userData.name = results.response;
        session.endDialog();
    }
]);
bot.dialog('/time', [
    function (session) {
        session.send('The time is '+new Date().getHours()+":"+new Date().getMinutes());        
    }
]);



// const accessToken = "MRQQXGF3QUFBV5BI4BTC7RDKPIO2NYWG";

// const actions = {
//   send(request, response) {
//       return new Promise(function(resolve, reject) {
//         console.log(JSON.stringify(response));
//         return resolve();
//       });
//     },
//     getTime({context, entities}) {
//     return new Promise(function(resolve, reject) {
//       // Here should go the api call, e.g.:
//       // context.forecast = apiCall(context.loc)
//       context.time = new Date().toDateString();
//       return resolve(context);
//     });
//   }

// };

// const client = new Wit({accessToken, actions});

/* GET home page. */
// router.get('/', function(req, res, next) {
//   if(req.query.message){
//     client.message(req.query.message, {})
//     .then((data) => {
//       console.log('Yay, got response: ' + JSON.stringify(data));
//       res.send("got response");
//     })
//     .catch((error) => {
//       console.log('NOOOO, error response: ' + JSON.stringify(error));
//        res.send("Error, Try again"); 
//     });
//   }
//   else res.send("What?");
// });


module.exports = router;
