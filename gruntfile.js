module.exports = function(grunt) {


    require('./create-webfont-dropdown.js');

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
                outputCss: 'dist/webfontDropdown.css',
                outputJs: 'dist/webfontDropdown.js',

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