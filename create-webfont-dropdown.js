var grunt = require('grunt');
var fs = require('fs');
var request = require('request');
var async = require('async');
var Handlebars = require('handlebars');


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

    var fontNames = this.data.fonts;
    var CSS_TEMPLATE = fs.readFileSync('templates/defaultStyleTemplate.css').toString();
    var JS_TEMPLATE = fs.readFileSync('templates/fontDropdownTemplate.js').toString();

    var jsWithDefaultFonts = Handlebars.compile(JS_TEMPLATE)({defaultFonts:"['" + fontNames.join("', '")  + "']"});
    var outputCssBanner = (this.data.outputCssBanner || '') + CSS_TEMPLATE;

    grunt.file.write(this.data.outputJs, jsWithDefaultFonts);

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
});

