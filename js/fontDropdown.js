window.GoogleWebfontDropdown = {

    create : function(options){
        var self = this;
        return {
            initialize : function(){
                options = $.extend({}, {
                    onSelected:$.noop,
                    initialFont:null
                }, options);

                $("body").on("click", ".gwfd-font-dropdown li a", function(){
                    var selHTML = $(this).html();
                    $(this).closest('div').find('button[data-toggle="dropdown"]').html(selHTML + self.CARET);
                    options.onSelected($(this).find('span').html(), $(this).find('span').css('font-family'), $(this).data('font-url'));
                });

                if (options.initialFont){
                    this.selectFont(options.initialFont);
                }
            },

            selectFont : function(fontName){
                $('.gwfd-font-dropdown .btn').html('<span style="font-family:' + "'" + fontName + "'" + '">' + fontName + '</span>' + self.CARET)
            }
        }.initialize(options);
    },

    CARET : ' <span class="pull-right"><span class="caret"></span></span>'

}
