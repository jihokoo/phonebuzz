var express = require('express');
var router = express.Router();
var twilio = require('twilio');

// Initial Prompt: XML response object
var prompt = new twilio.TwimlResponse();
prompt.say('Welcome to PhoneBuzz!')
	.gather({
		action: 'http://aqueous-wave-1146.herokuapp.com/phonebuzz',
		finishOnKey: '#'
	}, function() {
		this.say('Please enter a whole number greater than zero, then press the hash symbol to submit.')
	});

router.get('/', function(req, res) {
	res.writeHead(200, {'Content-Type': 'text/xml'});
	res.end(prompt.toString());
});

router.post('/', function(req, res) {
	res.writeHead(200, {'Content-Type': 'text/xml'});
	res.end(prompt.toString());
});

router.post('/phonebuzz', function(req, res) {
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