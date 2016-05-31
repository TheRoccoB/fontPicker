module.exports = function(grunt) {


    var fs = require('fs');
    var request = require('request');
    var async = require('async');


    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        connect: {
            server: {
                options: {
                    port: 8000,
                    base: {
                        path: '.',
                        options: {
                            index: 'index.html',
                            maxAge: 300000
                        }
                    }
                }
            }
        },
        getFonts: {
            foo: {
                outputCss: 'css/font.css',
                outputDropdown:'tmp/dropdown.html',
                fonts: [
                    'Droid Serif',
                    'Bitter',
                    'Oswald',
                    'Francois One',
                    'Indie Flower',
                    'Dancing Script',
                    'Special Elite',
                    'Audiowide',
                    'Chewy',
                    'Ubuntu Mono',
                    'Righteous',
                    'Bevan',
                    'Orbitron',
                    'Rochester',
                    'Racing Sans One',
                    'Homenaje',
                    'Lato',
                    'Open Sans'
                ]
            }

        },

        watch: {
            scripts: {
                files: ['**/*'],
                tasks: [],
                options: {
                    livereload:true
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerMultiTask('getFonts', 'Log stuff.', function() {
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
                return '        <li style="font-family:' + "'" + fontData.name + "'" + '"><a href="#" data-font-url="' + fontData.url + '">' + fontData.name + '</a></li>'
            }).join('\n');

            return '<div class="dropdown">\n' +
            '    <button class="btn btn-default dropdown-toggle" type="button" id="dropdownMenu1" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">Select Font <span class="caret"></span></button>\n' +
            '    <ul class="dropdown-menu" aria-labelledby="dropdownMenu1">\n' +
                    fontHTML + '\n' +
            '    </ul>\n' +
            '</div>\n';
        }


        var fontNames = this.data.fonts;

        grunt.file.write(this.data.outputDropdown, generateDropdown(fontNames.map(function(fontName){
            return {name:fontName, url:'https://fonts.googleapis.com/css?family=' + encodeURIComponent(fontName)}
        })));

        var urlNames = fontNames.map(function(item){
            var encoded = encodeURIComponent(item);
            return 'https://fonts.googleapis.com/css?family=' + encoded + '&text=' + encoded;
        });

        var outputCssFilename = this.data.outputCss;

        async.map(urlNames, fetchRawCss, function(err, results){
            if (err){
                console.log('something went wrong')
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
                           console.log('something went horrifically wrong')
                           done();
                       }

                       var outputFileContents = '';
                       for (var i=0; i<rawCSSArray.length; i++){
                           var rawCSS = rawCSSArray[i];
                           var b64WoffData = b64WoffDataArray[i];
                           outputFileContents += rawCSS.replace(/url\(.*?\)/, 'url(data:application/font-woff;charset=utf-8;base64,' +  b64WoffData + ')');
                       }

                       grunt.file.write(outputCssFilename, outputFileContents);
                       done();
                   }
                });
            }
        });

        console.log(urlNames);

    });

    // Default task(s).
    grunt.registerTask('default', ['connect:server', 'watch']);

};