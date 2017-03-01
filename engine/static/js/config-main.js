

function fieldsValid(){
    var all = accepted = 0;

    $('#config input:not([type="submit"])').each(function(){
        
        var required = $(this).attr('required');

        if (required || !required && $(this).val().length ){
            all += 1;

            var pattern = $(this).attr('data-pattern');
            if ($(this).val().length > 0){
                rg = new RegExp(pattern);

                if ((pattern && rg.test($(this).val())) || !pattern){
                    $( this ).removeClass('invalid-input');
                    accepted += 1;
                }else{
                    $( this ).addClass('invalid-input');
                }                  
            }
        }
    })

    return all == accepted;
}



$(document).ready(function() {
    
    $('input').keyup(function() {

        if (fieldsValid()){
            $('#submit').removeClass('btn-pink-inactive').addClass('btn-pink-active').removeAttr('disabled')
        }
        else{
            $('#submit').removeClass('btn-pink-active').addClass('btn-pink-inactive').attr('disabled', 'disabled')
        }
        
    });

    $('input').on('change', function(){
        $(this).trigger('keyup');
    });
    $('input').on('select', function(){
        $(this).trigger('keyup');
    });
})
