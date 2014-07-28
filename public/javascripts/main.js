$(document).ready(function(){
  $('.phone_us').mask('+1 (000) 000-0000');
  console.log('hellllooooo');
  $('#submit').bar({
    color        : '#1E90FF',
    background_color : '#FFFFFF',
    position     : 'bottom',
    removebutton     : false,
    message      : 'Thank you, your call is being processed!',
    time       : 4000
  });

  $('#submit').click(function(e){
    $.post( "/call", function( data ) {
      $('.phone_us').val('')
    });
  })
});