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
                fonts: [
                    'Open Sans',
                    'Roboto Condensed',
                    'Source Sans Pro'
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
                    console.log('something went horribly wrong');
                }
            });
        };

        var urlNames = this.data.fonts.map(function(item){
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
                           outputFileContents += rawCSS.replace(/url\(.*?\)/, 'url(data:application/font-woff,' +  b64WoffData + ')');
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