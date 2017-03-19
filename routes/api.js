'use strict';

let Wit = null;
var express = require('express');
var router = express.Router();
var Uber = require('node-uber');
var uber = new Uber({
    client_id: 'exGa_FaLJ7vjpXBVS81wb1js-YOH6Odx',
    client_secret: 'gLnGeh3A7DGAO5-R6Gn9HyECWhT8299e3Km30VWG',
    server_token: 'dPDUMh8K09edXz1vWG-43oR-LWEHTOMyKZGm7wqW',
    redirect_uri: 'https://crab.anikrajc.com/api/uberCallback',
    name: 'Crab Assistant',
    language: 'en_US', // optional, defaults to en_US
    sandbox: true // optional, defaults to false
});

var Msession;
// Wit = require('node-wit').Wit;

var builder = require('botbuilder');
var connector = new builder.ChatConnector({
    appId: "6ac77405-4dbd-46f0-b68e-60030031e004",
    appPassword: "JuCTL4CVh8ZpnAKvnk1XF9K"
});
var bot = new builder.UniversalBot(connector);
var intents = new builder.IntentDialog();

router.post('/bot', connector.listen());

router.get('/uberLogin', function(request, response) {
    var url = uber.getAuthorizeUrl(['history', 'profile', 'request', 'places']);
    response.redirect(url);
});

router.get('/uberCallback', function(request, response) {
    uber.authorizationAsync({ authorization_code: request.query.code })
        .spread(function(access_token, refresh_token, authorizedScopes, tokenExpiration) {
            // store the user id and associated access_token, refresh_token, scopes and token expiration date
            console.log('New access_token retrieved: ' + access_token);
            console.log('... token allows access to scopes: ' + authorizedScopes);
            console.log('... token is valid until: ' + tokenExpiration);
            console.log('... after token expiration, re-authorize using refresh_token: ' + refresh_token);

            Msession.userData.uberAccessToken = access_token;
            Msession.userData.uberAuthorizedScopes = authorizedScopes;
            Msession.userData.uberTokenExpiration = tokenExpiration;
            Msession.userData.uberRefresh_token = refresh_token;

            // redirect the user back to your actual app
            response.redirect('/');
        })
        .error(function(err) {
            console.error(err);
        });
});

bot.dialog('/', intents);

intents.matches(/^change name/i, [
    function(session) {
        console.log("match change name");
        session.beginDialog('/profile');
    },
    function(session, results) {
        session.send('Ok... Changed your name to %s', session.userData.name);
    }
]);

intents.matches(/^what is the time/i, [
    function(session) {
        console.log("match time1");
        session.beginDialog('/time');
    }
]);
intents.matches(/^time/i, [
    function(session) {
        console.log("match time2");
        session.beginDialog('/time');
    }
]);

intents.matches(/^book cab/i, [
    function(session) {
        session.beginDialog('/uber');
    }
]);
intents.matches(/^book uber/i, [
    function(session) {
        session.beginDialog('/uber');
    }
]);


intents.onDefault([
    function(session, args, next) {
        if (!session.userData.name) {
            session.beginDialog('/profile');
        } else {
            next();
        }
    },
    function(session, results) {
        session.send('Hello %s!', session.userData.name);
    }
]);

bot.dialog('/profile', [
    function(session) {
        builder.Prompts.text(session, 'Hi! What is your name?');
    },
    function(session, results) {
        session.userData.name = results.response;
        session.endDialog();
    }
]);
bot.dialog('/time', [
    function(session) {
        session.send('The time is ' + new Date().getHours() + ":" + new Date().getMinutes());
        session.endDialog();
    }
]);
bot.dialog('/uber', [
    function(session) {
        Msession = session;
        if (!session.userData.uberAccessToken) {
            router.redirect("/uberLogin");
        } else {
            console.log('access_token exist: ' + session.userData.uberAccessToken);
        }
        // session.send('The time is ' + new Date().getHours() + ":" + new Date().getMinutes());
        session.endDialog();
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