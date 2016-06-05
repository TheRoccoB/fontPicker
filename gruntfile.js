module.exports = function(grunt) {


    require('./create-google-webfont-dropdown.js');


    var HEADER = "<!DOCTYPE html>" + `
    <html>
        <head>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.6/css/bootstrap.min.css" />
            <link rel="stylesheet" href="../css/font.css" />
            <link rel="stylesheet" href="../css/main.css" />
            <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/2.2.4/jquery.js"></script>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.6/js/bootstrap.min.js"></script>
            <script src="../js/main.js"></script>
        </head>
        <body>` + "\n\n";
    var FOOTER = `
        </body>
    </html>`;
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

                outputDropdownBanner: HEADER,
                outputDropdownFooter: FOOTER,

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


    // Default task(s).
    grunt.registerTask('default', ['connect:server', 'watch']);

};