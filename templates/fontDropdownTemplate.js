window.WebfontDropdown = {

    create : function(selector, options){
        var self = this;
        return {
            _onSelected : $.noop,

            initialize : function(){
                options = $.extend({}, {
                    onSelected:$.noop,
                    availableFonts: self.DEFAULT_FONTS,
                    initialFont:null
                }, options);

                var that = this;

                this._onSelected = options.onSelected;

                $(selector).html(this._generateDropdown(options.availableFonts));

                $(selector).on("click", ".wfd-font-dropdown li a", function(){
                    that.selectFont($(this).find('span').html());
                });

                if (options.initialFont){
                    this.selectFont(options.initialFont);
                }
            },

            selectFont : function(fontName){
                $(selector + ' .wfd-font-dropdown .btn').html('<span style="font-family:' + "'" + fontName + "'" + '">' + fontName + '</span>' + self.CARET);
                this._onSelected(fontName, "'" + fontName + "'");
            },

            _generateDropdown : function(fontList){
                var fontHTML = fontList.map(function(fontName){
                    var encoded = encodeURIComponent(fontName);
                    return '        <li><a href="javascript:void(0);" data-font-url="' + 'https://fonts.googleapis.com/css?family=' + encoded + '&text=' + encoded + '"><span style="font-family:' + "'" + fontName + "'" + '">'  + fontName + '</span></a></li>'
                }).join('\n');

                return '<div class="dropdown wfd-font-dropdown">\n' +
                    '    <button class="btn btn-default dropdown-toggle" type="button" id="dropdownMenu1" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">Select Font ' + self.CARET + '</button>\n' +
                    '    <ul class="dropdown-menu" aria-labelledby="dropdownMenu1">\n' +
                    fontHTML + '\n' +
                    '    </ul>\n' +
                    '</div>\n';
            }
        }.initialize(options);
    },

    CARET : ' <span class="pull-right"><span class="caret"></span></span>',
    DEFAULT_FONTS: {{{defaultFonts}}}

}
