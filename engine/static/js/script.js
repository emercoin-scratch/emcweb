'use strict';

;(function($) {
    function fixHeight() {
        var windowHeight = $(window).height();
        $('#page-wrapper').css('min-height', windowHeight + 'px');
    }

    $(document).ready(function(){
        fixHeight();
    });
    $(window).resize(fixHeight);
}(jQuery));

