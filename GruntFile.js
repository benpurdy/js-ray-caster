module.exports = function(grunt) {

  grunt.initConfig({

    env : {
      dev : {
        CONFIG : 'DEV',
       // DEBUG : true,
        STATS : true
      },

      dist : {
        CONFIG : 'RELEASE',
        //STATS : true
      }
    },

    preprocess : {
      options: {
        inline : true,
        srcDir : 'build/'
      },
      html : {
        src : 'build/*.html'
      },
      js : {
        src : 'build/js/*.js'
      }
    },

    uglify: {
      dist: {
        options:{
          sourceMap: true
        },
        files: {
          'public/js/app.min.js': [
            'build/js/util.js', 
            'build/js/world.js', 
            'build/js/renderer.js', 
            'build/js/input.js', 
            'build/js/gl.js',
            'build/js/app.js'
          ]
        }
      }
    },

    clean : ["build/", "public/"],

    copy: {
      prepare:{
        files: [
          {
            expand: true, 
            cwd: 'src/',
            src: ['js/*.js'], 
            dest: 'build/', 
            filter: 'isFile'
          },
          {
            expand: true, 
            cwd: 'src/',
            src: ['shaders/*'], 
            dest: 'build/', 
            filter: 'isFile'
          },
          {
            expand: true, 
            cwd: 'src/html/',
            src: ['*.html'], 
            dest: 'build/', 
            filter: 'isFile'
          },
          {
            expand: true, 
            cwd: 'src/css/',
            src: ['*.css'], 
            dest: 'public/css', 
            filter: 'isFile'
          },
          {
            expand: true, 
            cwd: 'src/images/',
            src: ['*.*'], 
            dest: 'public/images', 
            filter: 'isFile'
          }
        ],
      },

      finishdev : {
        files:[
          {
            expand: true, 
            cwd: 'build/',
            src: ['**/*.html', '**/*.css', '**/*.png', '**/*.js'], 
            dest: 'public/', 
            filter: 'isFile'
          }
        ]
      },

      finishdist : {
        files:[
          {
            expand: true, 
            cwd: 'build/',
            src: ['**/*.html', '**/*.css', '**/*.png','js/app.min.js', 'js/app.min.js.map'], 
            dest: 'public/', 
            filter: 'isFile'
          }
        ]
      }
    },

    watch: {
      files: ['src/**/*'],
      tasks: ['dev'],
      options: {
        spawn: false,
      },
    },

    connect: {
      server: {
        options: {
          port: 8080,
          hostname: '*',
          base: 'public/'
        }
      }
    }
  });

  
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-preprocess');
  grunt.loadNpmTasks('grunt-env');
  
  grunt.registerTask('dev', ['clean', 'env:dev', 'copy:prepare', 'preprocess', 'copy:finishdev']);
  grunt.registerTask('dist', ['clean', 'env:dist', 'copy:prepare', 'preprocess', 'uglify:dist', 'copy:finishdist']);

  grunt.registerTask('start', ['dev', 'connect', 'watch']);

  grunt.registerTask('default', ['dev']);
};