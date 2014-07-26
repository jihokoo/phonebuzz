# PhoneBuzz (FizzBuzz over the phone)

### Required Configurations

* Navigate to [app.js](https://github.com/jihokoo/lendup/blob/master/app.js) and input your `AUTH_TOKEN` (needed to validate the `X-Twilio-Signature` header):

	app.all('*', function(req, res, next){
		if (twilio.validateExpressRequest(req, 'ENTER_YOUR_AUTH_TOKEN_HERE')) {
			next();
	  }
	  else {
	    return res.send(403, 'Forbidden access. This application can only be accessed by Twilio.');
	  }
	});

* Please point your Twilio number to `http://aqueous-wave-1146.herokuapp.com/`. The request type can be either `POST` or `GET`.

* This application is hosted on Heroku so nothing needs to be run locally. Just call your Twilio number to get started.

# Thank you!