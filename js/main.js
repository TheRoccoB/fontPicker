$(function(){
    WebfontDropdown.create("#font-holder-1", {
        initialFont:'Francois One',
        availableFonts:['Francois One', 'Indie Flower', 'Dancing Script'],
        onSelected:function(fontName, quotedFontFamily){
            WebFont.load({
                google: {
                    families: [fontName]
                },
                active:function(){
                    $('#example-1').css('font-family', quotedFontFamily);
                }
            });
        }
    });

    WebfontDropdown.create("#font-holder-2", {
        //not specifying initialFont leaves the selector on "select font.
        //not specifying fonts here = all fonts
        onSelected:function(fontName, quotedFontFamily){
            WebFont.load({
                google: {
                    families: [fontName]
                },
                active:function(){
                    $('#example-2').css('font-family', quotedFontFamily);
                }
            });
        }
    });
});