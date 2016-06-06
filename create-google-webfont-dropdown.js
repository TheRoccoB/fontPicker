var grunt = require('grunt');
var fs = require('fs');
var request = require('request');
var async = require('async');


grunt.registerMultiTask('getFonts', '', function() {
    var done = this.async();

    var handleResponse = function(cb){
        return function (err, response, body) {
            if (err) {
                cb(err);
            } else {
                cb(null, body); // First param indicates error, null=> no error
            }
        }
    };

    var fetchRawCss = function(file,cb){
        request({
            url: file,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows; U; MSIE 9.0; WIndows NT 9.0; en-US))'
            }
        }, handleResponse(cb));
    };

    var fetchBinary = function(file,cb){
        request({
            url: file,
            encoding:null
        }, handleResponse(cb));
    };

    var extractWoffURLs = function(rawCSSArray){
        return rawCSSArray.map(function(rawCSS){
            var match = /url\((.*?)\)/.exec(rawCSS);
            if (match && match.length === 2){
                return match[1];
            }
            else{
                console.log('unable to find woff url in stylesheet\nStylesheet contents:\n', rawCSS);
                return '';
            }
        });
    };

    var generateDropdown = function(fontList){
        var fontHTML = fontList.map(function(fontData){
            return '        <li><a href="javascript:void(0);" data-font-url="' + fontData.url + '"><span style="font-family:' + "'" + fontData.name + "'" + '">'  + fontData.name + '</span></a></li>'
        }).join('\n');

        return '<div class="dropdown gwfd-font-dropdown">\n' +
            '    <button class="btn btn-default dropdown-toggle" type="button" id="dropdownMenu1" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">Select Font <span class="pull-right"><span class="caret"></span></span></button>\n' +
            '    <ul class="dropdown-menu" aria-labelledby="dropdownMenu1">\n' +
            fontHTML + '\n' +
            '    </ul>\n' +
            '</div>\n';
    }


    var CSS_TEMPLATE = "\n" +
        ".gwfd-font-dropdown .btn{\n" +
        "    width:200px;\n" +
        "    text-align: left;\n" +
        "    padding: 3px 8px 3px 20px;\n" +
        "}\n" +
        "\n" +
        ".gwfd-font-dropdown .dropdown-menu{\n" +
        "    width:200px;\n" +
        "}\n\n";


    var fontNames = this.data.fonts;
    var outputCssBanner = (this.data.outputCssBanner || '') + CSS_TEMPLATE;
    var outputDropdownBanner = this.data.outputDropdownBanner || '';
    var outputDropdownFooter = this.data.outputDropdownFooter || '';

    console.log("THIS", this.data);

    grunt.file.write(this.data.outputDropdown, outputDropdownBanner + generateDropdown(fontNames.map(function(fontName){
        return {name:fontName, url:'https://fonts.googleapis.com/css?family=' + encodeURIComponent(fontName)}
    })) + '\n' + outputDropdownFooter);

    var urlNames = fontNames.map(function(item){
        var encoded = encodeURIComponent(item);
        return 'https://fonts.googleapis.com/css?family=' + encoded + '&text=' + encoded;
    });

    var outputCssFilename = this.data.outputCss;

    async.map(urlNames, fetchRawCss, function(err, results){
        if (err){
            console.log('something went wrong');
            done();
        } else {
            var rawCSSArray = results;
            var woffURLs = extractWoffURLs(rawCSSArray);
            async.map(woffURLs, fetchBinary, function(err, results){
                if (err){
                    console.log('something went insanely wrong');
                    done();
                }
                else{
                    var binaryWoffData = results;
                    var b64WoffDataArray = binaryWoffData.map(function(woffBinary){
                        return new Buffer(woffBinary).toString('base64');
                    });

                    if (rawCSSArray.length !== b64WoffDataArray.length){
                        console.log('something went horrifically wrong');
                        done();
                    }

                    var outputFileContents = '';
                    for (var i=0; i<rawCSSArray.length; i++){
                        var rawCSS = rawCSSArray[i];
                        var b64WoffData = b64WoffDataArray[i];
                        outputFileContents += rawCSS.replace(/url\(.*?\)/, 'url(data:application/font-woff;charset=utf-8;base64,' +  b64WoffData + ')');
                    }

                    grunt.file.write(outputCssFilename, outputCssBanner + outputFileContents);
                    done();
                }
            });
        }
    });

    //console.log(urlNames);

});

