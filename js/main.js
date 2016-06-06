$(function(){
    var dropdown = GoogleWebfontDropdown.create({
        initialFont:'Francois One',
        onSelected:function(fontName, quotedFontFamily, fontCSS){
            WebFont.load({
                google: {
                    families: [fontName]
                },
                active:function(){
                    $('.new-font').css('font-family', quotedFontFamily);
                }
            });
        }
    });
});