# PhoneBuzz

Twilio cannot normally make requests to localhost because we are on two different networks, so I am hosting this application on Heroku. This means that for the X-Twilio-Signature validation check to work and for the application to make calls, the user needs to set his/her own Twilio account credentials on Heroku.
I will need the reviewer's email so I can add him/her as a collaborator on Heroku to change config variables.

* Log-on to Heroku
* Click on acqueous-wave-1146 (the name Heroku gave my application)
* Go to Settings on the application's dash board
* Look at the row that says Config Variables in white and click 'Reveal config vars' to the right
* Then manually edit the three variables which can be found on your Twilio account dashboard. (start TWILIO_NUMBER with +1 and then the 10 digit phone number)

## Phase 1 - Complete

* Make sure to configure your Twilio number and point it to 'http://aqueous-wave-1146.herokuapp.com/'
* The request type be must be `POST`
* Call your Twilio number to play PhoneBuzz

## Phase 2 - Complete

* Go to this application's [homepage]('http://aqueous-wave-1146.herokuapp.com/') on your browser
* Enter your personal phone number and press submit to play PhoneBuzz

## Phase 3 - Complete

* Go to this application's [homepage]('http://aqueous-wave-1146.herokuapp.com/') on your browser
* Enter your personal phone number
* Enter pause time (default is to make call immediately) and press submit to play

# Thank you!