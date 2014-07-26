# PhoneBuzz (FizzBuzz over the phone)

### Required Configurations

* Clone the application.

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

* Twilio cannot make requests to localhost because we are most likely on two different networks, so I am hosting this application on Heroku. This means that for the X-Twilio-Signature validation check to work, the user needs to deploy to Heroku after making the changes noted in the two bullet points directly above. (I will need to add the reviewer for his/her Github and Heroku username/email to add the person as a contributor)

* Finally, run...

```bash
$ npm git add .
```
```bash
$ npm git commit .
```
```bash
$ npm git push .
```
```bash
$ npm git push heroku master .
```


# Thank you!