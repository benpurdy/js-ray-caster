module.exports = function(grunt) {

  grunt.initConfig({

    env : {
      options : {
        DEBUG: true,
        STATS: false
      },
    },

    watch: {
      files: ['<%= jshint.files %>'],
      tasks: ['build']
    },

    preprocess : {
      html : {
        src : 'src/html/*.html',
        dest : 'build/'
      }
    }
  });

  grunt.loadNpmTasks('grunt-preprocess');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('default', ['preprocess']);

};