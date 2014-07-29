var express = require('express');
var router = express.Router();
var twilio = require('twilio');
var moment = require('moment');
var Call = require('../models/calls.js')['Call']

// Twilio client object
var client = twilio(process.env.ACCOUNT_SID, process.env.AUTH_TOKEN);

// Initial Prompt: XML response object
var prompt = new twilio.TwimlResponse();

prompt.say('Welcome to PhoneBuzz!')
	.gather({
		action: 'http://aqueous-wave-1146.herokuapp.com/phonebuzz',
		finishOnKey: '#'
	}, function() {
		this.say('Please enter a whole number greater than zero, then press the hash symbol to submit.')
	});


// Check for and validate X-Twilio-Signature header.
var isAuthenticated = function(req, res, next) {
	if (twilio.validateExpressRequest(req, process.env.AUTH_TOKEN)) next();
  else next(new Error('Forbidden Access', 403));
};

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

/* POST to root url and receive TwiML response (should be GET, but I wanted to use the root URL) */
router.post('/', isAuthenticated, function(req, res) {
	console.log(req.body);
	res.writeHead(200, {'Content-Type': 'text/xml'});
	res.end(prompt.toString());
});

/* Post user phone number to make call */
router.post('/call', function(req, res) {
	var userNumber = req.body.userNumber;
	var delayTime = parseInt(req.body.delay);

	var callTime = new moment();

	var newCall = new Call({delay: delayTime, from: userNumber});
	newCall.callTime = callTime.add('seconds', delayTime).utc().toDate();
	newCall.save(); // save to database

	setTimeout(function(){ 
		client.makeCall({
	    to:'+1'+userNumber, // Any number Twilio can call
	    from: process.env.TWILIO_NUMBER, // A number you bought from Twilio and can use for outbound communication
	    url: 'http://aqueous-wave-1146.herokuapp.com/?id=' + newCall.id // A URL that produces an XML document (TwiML) which contains instructions for the call
		}, function(err, responseData) {
	    // function is executed when the call has been initiated.
		});
	}, delayTime * 1000); // delay interval in milliseconds before the anonymous function inside setTimeout is run
	
	res.send(200);
});

// replay will dial the same phone number, but if the call has
// been made before, we just replay the result, instead of 
// asking for input

/* Post user input gathered during Twilio call */
router.post('/phonebuzz', isAuthenticated, function(req, res) {
	// FizzBuzz Result: XML response object
	var fizzBuzz = new twilio.TwimlResponse();
	var result = '';
	if(req.body.Digits){
		// Main logic for FizzBuzz
		for(var i = 1; i < parseInt(req.body.Digits) + 1; i++){
			result += (i%3? '' : 'Fizz') + (i%5? '' : 'Buzz') || i;
			result += ' ';
		}
		fizzBuzz.say('FizzBuzz has been calculated. The answer is.')
			.pause({ length: 2 })
			.say(result);
		res.writeHead(200, {'Content-Type': 'text/xml'});
		res.end(fizzBuzz.toString());
	} else{
		fizzBuzz.say('Sorry. Next time please enter a whole number greater than zero.');
		res.writeHead(200, {'Content-Type': 'text/xml'});
		res.end(fizzBuzz.toString());
	}
});

module.exports = router;