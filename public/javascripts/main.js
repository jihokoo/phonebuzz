$(document).ready(function(){
  $('.phone_us').mask('+1 (000) 000-0000');
  console.log('hellllooooo');

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
  $('#submit').click(function(e){
    if(numberValidation.test($('.phone_us').cleanVal())){
      $.post( "/call", {userNumber: $('.phone_us').cleanVal()}, function( data ) {
        $('.phone_us').val('')
        $('#success').click();
      });
    } else{
      $('#failure').click();
    }
    
    return false;
  })
});