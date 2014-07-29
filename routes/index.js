var express = require('express');
var router = express.Router();
var twilio = require('twilio');
var moment = require('moment');
var Call = require('../models/calls.js')['Call']

// Twilio credentials
var ACCOUNT_SID = 'AC463a95df38873bafbd05da055f830807';
var AUTH_TOKEN = '17ba3855de98bd943bfe87724c1c6365';
var TWILIO_NUMBER = '+12014307826';

// Twilio client object
var client = twilio(ACCOUNT_SID, AUTH_TOKEN);

/* Check for and validate X-Twilio-Signature header. */
var isAuthenticated = function(req, res, next) {
	if (twilio.validateExpressRequest(req, AUTH_TOKEN)) next();
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
	var call = req.query.id;
	var from = req.body.From;
	var to = req.body.To;
	var prompt = new twilio.TwimlResponse();
	if(call){
		Call.findOne({_id: call}, function(err, call){
			// Initial Prompt: XML response object
			prompt.say('Welcome to PhoneBuzz!');

			if(call.countTo){
				prompt.say('FizzBuzz has been calculated. The answer is.')
					.pause({ length: 1 })
					.say(calculate(call.countTo));
			} else{
				prompt.gather({
						action: 'http://aqueous-wave-1146.herokuapp.com/phonebuzz?id='+call.id,
						finishOnKey: '#'
					}, function() {
						this.say('Please enter a whole number greater than zero, then press the hash symbol to submit.')
					});
			}
			res.writeHead(200, {'Content-Type': 'text/xml'});
			res.end(prompt.toString());
		});
	} else{
		prompt.say('Welcome to PhoneBuzz!')
			.gather({
				action: 'http://aqueous-wave-1146.herokuapp.com/phonebuzz?id='+call.id,
				finishOnKey: '#'
			}, function() {
				this.say('Please enter a whole number greater than zero, then press the hash symbol to submit.')
			});
		res.writeHead(200, {'Content-Type': 'text/xml'});
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
		from: TWILIO_NUMBER.substring(2), 
		to: userNumber,
		callTime: callTime.add('seconds', delayTime).utc().toDate()
	});

	newCall.save(); // save to database

	setTimeout(function(){ 
		client.makeCall({
	    to:'+1'+userNumber, // Any number Twilio can call
	    from: TWILIO_NUMBER, // A number you bought from Twilio and can use for outbound communication
	    url: 'http://aqueous-wave-1146.herokuapp.com/?id=' + newCall.id // A URL that produces an XML document (TwiML) which contains instructions for the call
		}, function(err, responseData) {
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
			if(call){
				call.countTo = countTo;
				call.save();
			}
		});

		fizzBuzz.say('FizzBuzz has been calculated. The answer is.')
			.pause({ length: 1 })
			.say(calculate(countTo)+'.')
			.say('Thank you!');
		res.writeHead(200, {'Content-Type': 'text/xml'});
		res.end(fizzBuzz.toString());
	} else{
		fizzBuzz.say('Sorry. Next time please enter a whole number greater than zero.');
		res.writeHead(200, {'Content-Type': 'text/xml'});
		res.end(fizzBuzz.toString());
	}
});

router.post('/replay', function(req, res){
	var id = req.body.id;
	var newCall;

	Call.findOne({_id: id}, function(err, call){
		newCall = new Call({
			delay: call.delay, 
			from: call.from, 
			countTo: call.countTo,
			to: call.to
		});
		newCall.save();

		client.makeCall({
	    to:'+1'+call.to, // Any number Twilio can call
	    from: '+1'+call.from, // A number you bought from Twilio and can use for outbound communication
	    url: 'http://aqueous-wave-1146.herokuapp.com/?id=' + newCall.id // A URL that produces an XML document (TwiML) which contains instructions for the call
		}, function(err, responseData) {
	    // function is executed when the call has been initiated.
		});
	});

	res.send(200);
});

module.exports = router;