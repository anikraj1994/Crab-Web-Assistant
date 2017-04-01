'use strict';

let Wit = null;
var express = require('express');
var router = express.Router();
var Uber = require('node-uber');
var request = require('request');
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
// var intents = new builder.IntentDialog();

var recognizer = new builder.LuisRecognizer('https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/56202e3c-f185-4f41-980f-1188432c9c48?subscription-key=ef7668a0e4524c8e8116c8cafd33b1bd&staging=true&verbose=true&timezoneOffset=0.0&q=');
var intents = new builder.IntentDialog({ recognizers: [recognizer] });

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

            // var result = [];
            // result.push(access_token);
            // result.push(authorizedScopes);
            // result.push(tokenExpiration);
            // result.push(refresh_token);

            // redirect the user back to your actual app
            var address = JSON.parse(request.query.state);
            bot.beginDialog(address, "/uberCallback", access_token);
            response.redirect("https://crab.anikrajc.com/close");
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
intents.matches('ChangeName', [
    function(session) {
        console.log("match change name");
        session.beginDialog('/profile');
    },
    function(session, results) {
        session.send('Ok... Changed your name to %s', session.userData.name);
    }
]);


intents.matches('LocationSearch', [
    function(session, args) {
        request('https://maps.googleapis.com/maps/api/place/textsearch/json?key=AIzaSyA08sPZr_DoNjC4JzV8vCj3csG0HZ3zUUM&query=' + args.query, function(error, response, body) {
            if (!error && response.statusCode == 200) {
                var result = JSON.parse(body).results;
                for (var loc in result) {
                    session.send("#^ " + loc.formatted_address);
                }

            }
        })
    }
]);

intents.matches(/^what is the time/i, [
    function(session) {
        console.log("match time1");
        session.beginDialog('/time');
    }
]);
intents.matches('Time', [
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
intents.matches('BookUber', [
    function(session) {
        session.beginDialog('/uber');
    }
]);

intents.matches(/^tell me a joke/i, [
    function(session) {
        var names = ["Glen Thomas", "Akshay Babu", "Joel Hanson", "Jeril Johnson", "Joselin Johnson", "Christo Jacob", "Benoy Jason", "Jerin Francis", "Anto Jose", "Dinil Davis", "Anik Raj", "Joshwa George", "Kiran MR"]
        var name = names[Math.floor(Math.random() * names.length)];
        request('http://api.icndb.com/jokes/random?firstName=' + name.split(" ")[0] + '&lastName=' + name.split(" ")[1], function(error, response, body) {
            if (!error && response.statusCode == 200) {
                session.send(JSON.parse(body).value.joke);
            }
        })
    }
]);
intents.matches('TellJoke', [
    function(session) {
        var names = ["Glen Thomas", "Akshay Babu", "Joel Hanson", "Jeril Johnson", "Joselin Johnson", "Christo Jacob", "Benoy Jason", "Jerin Francis", "Anto Jose", "Dinil Davis", "Anik Raj", "Joshwa George", "Kiran MR"]
        var name = names[Math.floor(Math.random() * names.length)];
        request('http://api.icndb.com/jokes/random?firstName=' + name.split(" ")[0] + '&lastName=' + name.split(" ")[1], function(error, response, body) {
            if (!error && response.statusCode == 200) {
                session.send(JSON.parse(body).value.joke);
            }
        })
    }
]);
// intents.matches('TellJoke', [
//     function(session) {
//         request('', function(error, response, body) {
//             if (!error && response.statusCode == 200) {
//                 session.send(body);
//             }
//         })
//     }
// ]);


intents.matches(/^sign out of uber/i, [
    function(session) {
        session.userData.uberAccessToken = null;
        session.send('Uber logged out');
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
bot.dialog('/address', [
    function(session) {
        builder.Prompts.text(session, 'Address is needed to book. What is your House Name?');
    },

    function(session, results) {
        session.userData.houseName = results.response;
        builder.Prompts.text(session, 'What is your Street Name?');
    },
    function(session, results) {
        session.userData.streetName = results.response;
        builder.Prompts.text(session, 'What is your City Name?');
    },
    function(session, results) {
        session.userData.cityName = results.response;
        builder.Prompts.text(session, 'What is your State Name?');
    },
    function(session, results) {
        session.userData.stateName = results.response;
        builder.Prompts.text(session, 'What is your Country Name?');
    },
    function(session, results) {
        session.userData.countryName = results.response;
        builder.Prompts.text(session, 'What is your Pincode?');
    },
    function(session, results) {
        session.userData.pincode = results.response;
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
        if (!session.userData.uberAccessToken) {
            // builder.Prompts.text(session, 'data not exist');
            var url = uber.getAuthorizeUrl(['history', 'profile', 'request', 'places']);
            session.send('# Signin ' + url + '&state=' + encodeURIComponent(JSON.stringify(session.message.address)) + '');

        } else {
            if (!session.userData.houseName) {
                session.beginDialog('/address');
            } else {
                // uber.products.getAllForAddressAsync(session.userData.streetName + ', ' + session.userData.cityName + ', ' + session.userData.stateName + ', ' + session.userData.countryName + ', ' + session.userData.pincode)
                uber.products.getAllForAddressAsync("1455 Market St, San Francisco, CA 94103, US")
                    .then(function(res) {
                        // console.log(res.products[1]);
                        session.send("Following cabs available");
                        res.products.forEach(function(product) {
                            session.send("#^" + product.display_name + "<br>" + product.description + "<br>Capacity : " + product.capacity);
                        });
                    })
                    .error(function(err) {
                        console.error(err);
                        session.send("something went wrong. try again.");
                    });
                session.endDialog();
            }
        }
        // session.send('The time is ' + new Date().getHours() + ":" + new Date().getMinutes());
    }
]);

bot.dialog('/uberCallback', [
    function(session, result) {
        session.send('Uber logged in. Now try booking uber');
        session.userData.uberAccessToken = result;
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