$(function() {
    $('.font-picker-item').click(function(){
        WebFont.load({
            google: {
                families: [this.innerHTML]
            },
            fontactive:function(fontName){
                $('#fontDemo').css('font-family', fontName);
            }
        });

    });


});
