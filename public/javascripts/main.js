$(document).ready(function(){
  $('.phone_us').mask('+1 (000) 000-0000');

  $('#success').bar({
    color        : '#1E90FF',
    background_color : '#FFFFFF',
    position     : 'bottom',
    removebutton     : false,
    message      : 'Thank you, your call is being processed!',
    time       : 4000
  });

  $('#failure').bar({
    color        : '#fff',
    background_color : '#ff827f',
    position     : 'bottom',
    removebutton     : false,
    message      : 'That is not a valid number.',
    time       : 4000
  });

  var numberValidation = /^[(]{0,1}[0-9]{3}[)\.\- ]{0,1}[0-9]{3}[\.\- ]{0,1}[0-9]{4}$/;

  var countDelay = function(){
    var totalTime = 0;
    var hours = parseInt($('#hours').val()) || 0;
    var minutes = parseInt($('#minutes').val()) || 0;
    var seconds = parseInt($('#seconds').val()) || 0;
    totalTime = (hours*120) + (minutes*60) + seconds;
    return totalTime;
  }

  $('.time').keyup(function () { 
    this.value = this.value.replace(/[^0-9\.]/g,'');
  });

  $('#submit').click(function(e){
    if(numberValidation.test($('.phone_us').cleanVal())){
      $.post( "/call", {userNumber: $('.phone_us').cleanVal(), pause: countDelay()}, function( data ) {
        $('.phone_us').val('')
        $('#hours').val('')
        $('#minutes').val('')
        $('#seconds').val('')
        $('#success').click();
      });
    } else{
      $('#failure').click();
    }
    
    return false;
  })
});