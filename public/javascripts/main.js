$(document).ready(function(){

  /* Function to make MongooseJS date more friendly */
  var parseDate = function(created_at){
    // convert to local string and remove seconds and year //
    var date = new Date(Date.parse(created_at)).toLocaleString().substr(0, 16);
    // get the two digit hour //
    var hour = date.substr(-5, 2);
    // convert to AM or PM //
    var ampm = hour<12 ? ' AM' : ' PM';
    if (hour>12) hour-= 12;
    if (hour==0) hour = 12;
    // return the formatted string //
    return date.substr(0, 11) + hour + date.substr(13) + ampm;
  };

  /* Populate calls immediately after document loads */
  (function(calls){
    var htmlString = '';
    calls.forEach(function(call){
      htmlString += '<button type="button" class="individual-call clearfix" id="'+call._id+'">'+
        '<ul class="nav nav-pills">'+
          '<li class="active" style="float: right; margin-right: 6%;"><a class="replay">replay</a></li>'+
          '<div class="call-content">'+
            'phone #: <span parse-url="props">'+call.to+'</span><br>'+
            'delay: <span parse-url="props">'+call.delay+' seconds</span><br>'+
            'time: <span parse-url="props">'+parseDate(call.callTime)+' seconds</span>'+
          '</div>'+
        '</ul>'+
      '</button>';
    });
    $('.calls-container').append(htmlString);
  })(calls);

  // Using jQuery plugin to auto format the phone number
  $('.phone_us').mask('+1 (000) 000-0000');

  // Alert when call succeeds
  $('#success').bar({
    color        : '#1E90FF',
    background_color : '#FFFFFF',
    position     : 'bottom',
    removebutton     : false,
    message      : 'Thank you, your call is being processed!',
    time       : 4000
  });

  // Alert when phone number is incorrect
  $('#failure').bar({
    color        : '#fff',
    background_color : '#ff827f',
    position     : 'bottom',
    removebutton     : false,
    message      : 'That is not a valid number.',
    time       : 4000
  });

  // RegEXP for making sure the phone number is legit.
  var numberValidation = /^[(]{0,1}[0-9]{3}[)\.\- ]{0,1}[0-9]{3}[\.\- ]{0,1}[0-9]{4}$/;

  /* Convert time to seconds */
  var countDelay = function(){
    var totalTime = 0;
    var hours = parseInt($('#hours').val()) || 0;
    var minutes = parseInt($('#minutes').val()) || 0;
    var seconds = parseInt($('#seconds').val()) || 0;
    totalTime = (hours*120) + (minutes*60) + seconds;
    return totalTime;
  };

  /* Function to make sure the time input is integer */
  $('.time').keyup(function () { 
    this.value = this.value.replace(/[^0-9\.]/g,'');
  });

  /* Post user input on clicking submit button */
  $('#submit').click(function(e){
    if(numberValidation.test($('.phone_us').cleanVal())){
      $.post( "/call", {userNumber: $('.phone_us').cleanVal(), delay: countDelay()}, function( data ) {
        $('.phone_us').val('');
        $('#hours').val('');
        $('#minutes').val('');
        $('#seconds').val('');
        $('#success').click();
      });
    } else{
      $('#failure').click();
    }
    
    return false;
  });

  /* Replay call on clicking replay button */
  $('.individual-call').click(function(){
    $.post( "/replay", {id: this.id}, function( data ) {
      $('#success').click();
    });
    return false;
  });
});