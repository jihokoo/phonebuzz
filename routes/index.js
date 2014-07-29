var express = require('express');
var router = express.Router();
var twilio = require('twilio');
var moment = require('moment');
var Call = require('../models/calls.js')['Call']

// Twilio client object
var client = twilio(process.env.ACCOUNT_SID, process.env.AUTH_TOKEN);

/* Check for and validate X-Twilio-Signature header. */
var isAuthenticated = function(req, res, next) {
	if (twilio.validateExpressRequest(req, process.env.AUTH_TOKEN)) next();
  else next(new Error('Forbidden Access', 403));
};

/* Main logic for FizzBuzz */
var calculate = function(countTo){
	var result = '';
	for(var i = 1; i < countTo + 1; i++){
		result += (i%3? '' : 'Fizz') + (i%5? '' : 'Buzz') || i;
		result += ' ';
	}
	return result;
};

/* GET home page and list of past calls. */
router.get('/', function(req, res) {
	Call.find(function(err, calls){
		res.render('index', { calls: calls });
	});
});

/* POST to root url and receive TwiML response */
router.post('/', isAuthenticated, function(req, res) {
	console.log(req.query);
	var call = req.query && req.query.id;
	var from = req.body.From;
	var to = req.body.To;
	var prompt = new twilio.TwimlResponse();
	// If call id was specified in query parameters
	// Otherwise the call was made by calling the Twilio Number
	if(call){
		Call.findOne({_id: call}, function(err, call){
			// Initial Prompt: XML response object
			prompt.say('Welcome to PhoneBuzz!');
			// If the call is a replay, then we do not need user input for FizzBuzz
			if(call.countTo){
				prompt.say('You previously entered'+ call.countTo +'. The answer is.')
					.pause({ length: 1 })
					.say(calculate(call.countTo));
			} else{
				// Give instruction in TwiML to gather user input.
				prompt.gather({
						action: 'http://aqueous-wave-1146.herokuapp.com/phonebuzz?id='+call.id,
						finishOnKey: '#'
					}, function() {
						this.say('Please enter a whole number greater than zero, then press the hash symbol to submit.')
					});
			}
			// Send response to Twilio in TwiML
			res.writeHead(200, {'Content-Type': 'text/xml'});
			res.end(prompt.toString());
		});
	} else{
		// This is when the user dials the Twilio number.
		prompt.say('Welcome to PhoneBuzz!')
			.gather({
				action: 'http://aqueous-wave-1146.herokuapp.com/phonebuzz',
				finishOnKey: '#'
			}, function() {
				this.say('Please enter a whole number greater than zero, then press the hash symbol to submit.')
			});
		res.writeHead(200, {'Content-Type': 'text/xml'});
		// Send response to Twilio in TwiML
		res.end(prompt.toString());
	}
});

/* Post user phone number to make call */
router.post('/call', function(req, res) {
	var userNumber = req.body.userNumber;
	var delayTime = parseInt(req.body.delay);

	var callTime = new moment();

	var newCall = new Call({
		delay: delayTime, 
		from: process.env.TWILIO_NUMBER.substring(2), 
		to: userNumber,
		callTime: callTime.add('seconds', delayTime).utc().toDate()
	});

	newCall.save(); // save to database

	setTimeout(function(){ 
		// Make call from Twilio number to the user inputted number
		client.makeCall({
	    to:'+1'+userNumber, // Any number Twilio can call
	    from: process.env.TWILIO_NUMBER, // A number you bought from Twilio and can use for outbound communication
	    url: 'http://aqueous-wave-1146.herokuapp.com/?id=' + newCall.id // A URL that produces an XML document (TwiML) which contains instructions for the call
		}, function(err, responseData) {
			if(err) console.log(err);
	    // function is executed when the call has been initiated.
		});
	}, delayTime * 1000); // delay interval in milliseconds before the anonymous function inside setTimeout is run
	
	res.send(200);
});

/* Post user input gathered during Twilio call */
router.post('/phonebuzz', isAuthenticated, function(req, res) {
	// FizzBuzz Result: XML response object
	var fizzBuzz = new twilio.TwimlResponse();
	var call = req.query.id;
	var countTo = parseInt(req.body.Digits);
	if(req.body.Digits){
		Call.findOne({_id: call}, function(err, call){
			// Only if call is defined
			// This is for the case that the call is made to Twilio number
			if(call){
				call.countTo = countTo;
				call.save();
			}
		});

		fizzBuzz.say('FizzBuzz has been calculated. The answer is.')
			.pause({ length: 1 })
			.say(calculate(countTo)+'.') // The function is at the top of this document
			.say('Thank you!');

		res.writeHead(200, {'Content-Type': 'text/xml'});
		res.end(fizzBuzz.toString());
	} else{
		// In case the user inputs zero, which is not allowed in FizzBuzz
		fizzBuzz.say('Sorry. Next time please enter a whole number greater than zero.');

		res.writeHead(200, {'Content-Type': 'text/xml'});
		res.end(fizzBuzz.toString());
	}
});

router.post('/replay', function(req, res){
	var id = req.body.id;
	var newCall;

	// Find the old call by its id in the database
	Call.findOne({_id: id}, function(err, call){
		// Create a new object with the same exact data, but different id
		newCall = new Call({
			delay: call.delay, 
			from: call.from, 
			countTo: call.countTo,
			to: call.to
		});
		newCall.save();

		client.makeCall({
	    to:'+1'+call.to,
	    from: '+1'+call.from, // Twilio Number
	    url: 'http://aqueous-wave-1146.herokuapp.com/?id=' + newCall.id // A URL that produces an XML document (TwiML) which contains instructions for the call
		}, function(err, responseData) {
			if(err) console.log(err);
	    // function is executed when the call has been initiated.
		});
	});

	res.send(200);
});

module.exports = router;