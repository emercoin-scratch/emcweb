

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

function passwordsValid(){
    if ($('input[name="password"]').val() != $('input[name="password2"]').val()){
        $('input[name="password2"]').addClass('invalid-input');
        return false;
    }else{
        $('input[name="password2"]').removeClass('invalid-input');
        return true;
    }
}

$(document).ready(function() {
    
    $('input').keyup(function() {
        var fValid = fieldsValid();
        var pValid = passwordsValid();
        
        if (fValid && pValid){
            $('#submit').removeClass('btn-green-inactive').addClass('btn-green-active').removeAttr('disabled')
        }
        else{
            $('#submit').removeClass('btn-green-active').addClass('btn-green-inactive').attr('disabled', 'disabled')
        }
        
    });

    $('input').on('change', function(){
        $(this).trigger('keyup');
    });
    $('input').on('select', function(){
        $(this).trigger('keyup');
    });
})
